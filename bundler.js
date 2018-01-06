'use strict';

const async = require('async');
const fs = require('fs');
const webpack = require('webpack');
const babel = require('babel-core');
const path = require('path');

const pluginDir = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(`${pluginDir}/package.json`));
const outputFile = process.argv[3] || `./${pkg.pluginName}.json`;

const webpackBase = require(`${__dirname}/plugins/.plugin.webpack.config.js`);

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
  return babel.transform(`(function (api) {${code}})(window.bindApi('${pkg.pluginName}'))`, pkg.babel || {}).code;
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

function packDeps(callback) {
  if (Object.keys(pkg.dependencies).length === 0) {
    callback(null);
    return;
  }
  let toPack = Object
    .keys(pkg.dependencies)
    .map(depName => `window.dependencies['${pkg.pluginName}']['${depName}'] = require('${depName}');`)
    .join('\n');
  // Create an empty plugin dependencies object before adding requires
  toPack = `window.dependencies['${pkg.pluginName}'] = {};${toPack}`;
  const fileName = `${pluginDir}/TEMP_PLUGIN_FILE`;
  fs.writeFileSync(fileName, toPack);

  const webpackConfig = webpackBase;
  webpackConfig.entry = fileName;
  webpackConfig.output = {
    filename: `${pluginDir}/TEMP_PLUGIN_OUTPUT`
  };

  webpack(webpackConfig, (err, stats) => {
    fs.unlinkSync(fileName, err => {
      if (err) console.error(err);
    });
    if (err || stats.hasErrors()) {
      callback(err);
      return;
    }
    pluginObject.dependencyCode = fs.readFileSync(webpackConfig.output.filename);
    fs.unlinkSync(webpackConfig.output.filename, err => {
      if (err) throw err;
    });
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
    packDeps(callback);
  })
], (err, results) => {
  if (err) throw err;
  fs.writeFileSync(outputFile, JSON.stringify(pluginObject));
});
