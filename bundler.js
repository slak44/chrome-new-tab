'use strict';

const async = require('async');
const fs = require('fs');
const browserify = require('browserify');
const babel = require('babel-core');

const pluginDir = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(`${pluginDir}/package.json`));

pkg.js = pkg.js || {};
pkg.html = pkg.html || {};
pkg.css = pkg.css || {};
pkg.dependencies = pkg.dependencies || {};

let pluginObject = {
  name: pkg.name,
  desc: pkg.description || '',
  version: pkg.version,
  author: pkg.author,
  settings: pkg.settings || [],
  preserveSettings: pkg.preserveSettings || false,
  js: {},
  css: {},
  html: {
    global: {},
    main: {},
    secondary: {}
  }
};

function iifeBabel(code) {
  return babel.transform(`(function (pluginName) {${code}})('${pkg.name}')`, pkg.babel || {}).code;
}

function mergeFiles(src, transform, callback) {
  src = src || [];
  async.series(
    src.map(file => callback => fs.readFile(`${pluginDir}/${file}`, {encoding: 'utf8'}, callback)),
    function (err, results) {
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
      fs.readFile(`${pluginDir}/${file}`, {encoding: 'utf8'}, function (err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        // The plugin format is querySelector: htmlData, while the data in pkg is filePath: querySelector
        pluginObject.html[view][pkg.html[view][file]] = data;
        callback(null, data);
      });
    }),
    function (err, results) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    }
  );
}

function browserifyDeps(callback) {
  let toBrowserify = Object.keys(pkg.dependencies).map(depName => `window['${depName}'] = require('${depName}');`).join('\n');
  let fileName = `${pluginDir}/browserify_TMPFILE`;
  fs.writeFileSync(fileName, toBrowserify);

  browserify(fileName, {standalone: `${pkg.name}-dependencies`}).bundle(function (err, result) {
    fs.unlinkSync(fileName, function (err) {
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
  callback => browserifyDeps(callback)
], function (err, results) {
  if (err) throw err;
  fs.writeFileSync(`./build/${pluginObject.name}.js`, JSON.stringify(pluginObject));
});
