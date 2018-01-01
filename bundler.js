'use strict';

const async = require('async');
const fs = require('fs');
const browserify = require('browserify');
const babel = require('babel-core');

const pluginDir = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(`${pluginDir}/package.json`));
const outputFile = process.argv[3] || `./${pkg.pluginName}.json`;

pkg.js = pkg.js || {};
pkg.html = pkg.html || {};
pkg.css = pkg.css || {};
pkg.dependencies = pkg.dependencies || {};

const pluginObject = {
  name: pkg.pluginName,
  desc: pkg.description || '',
  version: pkg.version,
  author: pkg.author,
  settings: pkg.settings || [],
  js: {},
  css: {},
  html: {
    global: {},
    main: {},
    secondary: {}
  }
};

function iifeBabel(code) {
  return babel.transform(`(function (pluginName) {${code}})('${pkg.pluginName}')`, pkg.babel || {}).code;
}

function mergeFiles(src = [], transform, callback) {
  async.series(
    src.map(file => callback => fs.readFile(`${pluginDir}/${file}`, {encoding: 'utf8'}, callback)),
    (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, transform(results.join('\n')));
    }
  );
}

function parseHtmlInserts(view, callback) {
  async.series(
    Object.keys(pkg.html[view] || {}).map(file => function (callback) {
      fs.readFile(`${pluginDir}/${file}`, {encoding: 'utf8'}, (err, data) => {
        if (err) {
          callback(err, null);
          return;
        }
        // The plugin format is querySelector: htmlData, while the data in pkg is filePath: querySelector
        pluginObject.html[view][pkg.html[view][file]] = data;
        callback(null, data);
      });
    }),
    (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    }
  );
}

function installDeps(callback) {
  require('child_process').exec('npm install', {cwd: pluginDir}, (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

function browserifyDeps(callback) {
  if (Object.keys(pkg.dependencies).length === 0) {
    callback(null);
    return;
  }
  let toBrowserify = Object
    .keys(pkg.dependencies)
    .map(depName => `window.dependencies['${pkg.pluginName}']['${depName}'] = require('${depName}');`)
    .join('\n');
  toBrowserify = `window.dependencies['${pkg.pluginName}'] = {};${toBrowserify}`; // Create the plugin's dependencies object before adding them
  const fileName = `${pluginDir}/browserify_TMPFILE`;
  fs.writeFileSync(fileName, toBrowserify);

  browserify(fileName, {standalone: `${pkg.name}-dependencies`}).bundle((err, result) => {
    fs.unlinkSync(fileName, err => {
      if (err) throw err;
    });
    if (err) {
      callback(err);
      return;
    }
    pluginObject.dependencyCode = result.toString();
    callback(null);
  });
}

async.parallel([
  callback => mergeFiles(pkg.js.init, result => iifeBabel(result), (err, data) => callback(err, pluginObject.js.init = data)),
  callback => mergeFiles(pkg.js.global, result => iifeBabel(result), (err, data) => callback(err, pluginObject.js.global = data)),
  callback => mergeFiles(pkg.js.main, result => iifeBabel(result), (err, data) => callback(err, pluginObject.js.main = data)),
  callback => mergeFiles(pkg.js.secondary, result => iifeBabel(result), (err, data) => callback(err, pluginObject.js.secondary = data)),
  callback => mergeFiles(pkg.css.global, result => result, (err, data) => callback(err, pluginObject.css.global = data)),
  callback => mergeFiles(pkg.css.main, result => result, (err, data) => callback(err, pluginObject.css.main = data)),
  callback => mergeFiles(pkg.css.secondary, result => result, (err, data) => callback(err, pluginObject.css.secondary = data)),
  callback => parseHtmlInserts('global', callback),
  callback => parseHtmlInserts('main', callback),
  callback => parseHtmlInserts('secondary', callback),
  callback => installDeps(err => {
    if (err) throw err;
    browserifyDeps(callback);
  })
], (err, results) => {
  if (err) throw err;
  fs.writeFileSync(outputFile, JSON.stringify(pluginObject));
});
