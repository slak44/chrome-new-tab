'use strict';

const path = require('path');
const MemoryFS = require('memory-fs');
const webpack = require('webpack');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const cp = bluebird.promisifyAll(require('child_process'), {multiArgs: true});

/*
  pkg: contents of plugin's package.json
  pluginDirPath: root directory of plugin
  outputPath: path to write output json at
*/
async function bundlePlugin(pkg, pluginDirPath, outputPath) {
  pkg.js = pkg.js || {};
  pkg.html = pkg.html || {};
  pkg.css = pkg.css || {};
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
      settings: {}
    }
  };
  const awaitFile = async filePath => await fs.readFileAsync(path.resolve(pluginDirPath, filePath), {encoding: 'utf8'});
  const views = ['global', 'main', 'settings'];
  views.filter(view => pkg.css[view]).forEach(view => pluginObject.css[view] = pkg.css[view].map(awaitFile).join('\n'));
  views.filter(view => pkg.html[view]).forEach(view => {
    Object.entries(pkg.html[view]).forEach(pair => pluginObject.html[view][pair[1]] = awaitFile(pair[0]));
  });
  const [npmStdout, npmStderr] = await cp.execAsync('npm install', {cwd: pluginDirPath});
  if (npmStdout) process.stdout.write(npmStdout);
  if (npmStderr) process.stderr.write(npmStderr);
  // Only run webpack if there is code
  const hooks = ['init', 'global', 'main', 'settings'].filter(hook => typeof pkg.js[hook] === 'string');
  if (hooks.length > 0) {
    const cfg = require(path.resolve(pluginDirPath, pkg.webpackConfig));
    cfg.entry = {};
    hooks.forEach(hook => cfg.entry[hook] = path.resolve(pluginDirPath, pkg.js[hook]));
    cfg.output = {};
    cfg.output.path = '/';
    cfg.output.filename = '[name].js';
    const compiler = webpack(cfg);
    const memfs = new MemoryFS();
    compiler.outputFileSystem = memfs;
    const stats = await (bluebird.promisify(compiler.run, {context: compiler}))();
    if (stats.hasErrors()) console.error(stats.toJson().errors);
    if (stats.hasWarnings()) console.warn(stats.toJson().warnings);
    hooks.forEach(hook => pluginObject.js[hook] =
      `(function (api) {\n${memfs.readFileSync(`/${hook}.js`)}\n})(window.bindApi('${pkg.pluginName}'))`);
  }
  fs.writeFileSync(outputPath, JSON.stringify(pluginObject));
}

if (require.main === module) {
  bundlePlugin(process.argv[2], require(path.resolve(process.argv[2], 'package.json')), process.argv[3]);
} else {
  module.exports = bundlePlugin;
}
