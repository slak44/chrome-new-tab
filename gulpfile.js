'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const webpack = require('webpack-stream');
const zip = require('gulp-zip');
const packCrx = require('gulp-crx-pack');
const gulpBump = require('gulp-bump');
const path = require('path');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const bundlePlugin = require('./bundler.js');

gulp.task('build-js', () => webpack(require('./webpack.config.js')).pipe(gulp.dest('./build/src')));

const lessFiles = ['src/main/main.less', 'src/settings/settings.less'];
gulp.task('build-css', () => gulp.src(lessFiles).pipe(less()).pipe(gulp.dest('./build/src')));

const copySrcGlob = ['src/main/main.html', 'src/settings/settings.html', 'src/manifest.json'];
gulp.task('copy-src', () => gulp.src(copySrcGlob).pipe(gulp.dest('./build/src')));

gulp.task('copy-deps', done => {
  gulp.src('node_modules/materialize-css/dist/fonts/roboto/*').pipe(gulp.dest('./build/src/fonts/roboto'));
  gulp.src('node_modules/material-design-icons/iconfont/*').pipe(gulp.dest('./build/src/fonts/material-design-icons'));
  gulp.src('node_modules/material-design-icons/action/svg/production/ic_settings_48px.svg')
    .pipe(gulp.dest('./build/src/settings-favicons'));
  gulp.src('node_modules/material-design-icons/action/2x_web/ic_settings_black_*.png')
    .pipe(gulp.dest('./build/src/settings-favicons'));
  gulp.src('node_modules/material-design-icons/action/2x_web/ic_tab_black_*.png')
    .pipe(gulp.dest('./build/src/extension-icons'));
  done();
});

gulp.task('extension', async () => {
  const privateKey = await fs.readFileAsync('./ext.pem', {encoding: 'utf8'})
    .catch(err => console.warn('Warning: Packing extension without a private key'));
  return gulp.src('./build/src').pipe(packCrx({privateKey, filename: 'ext.crx'})).pipe(gulp.dest('./build/dist'));
});

function runBundler(pluginName) {
  const pluginDirPath = path.resolve(__dirname, 'plugins', pluginName);
  const pkg = require(path.resolve(pluginDirPath, 'package.json'));
  const outputPath = path.resolve(__dirname, 'build/plugins', `${pluginName}.json`);
  return bundlePlugin(pkg, pluginDirPath, outputPath);
}

const pluginArray = ['fade', 'reddit', 'reddit-comments', 'repl', 'timedate', 'title'];

gulp.task('plugins', async done => {
  await fs.mkdirAsync(path.resolve(__dirname, 'build/plugins')).catch(err => {if (err.code !== 'EEXIST') throw err;});
  const res = await Promise.all(pluginArray.map(p => runBundler(p).catch(e => e)));
  res.filter(result => result instanceof Error).forEach(console.error);
});

gulp.task('pack-plugins', () => gulp.src('build/plugins/*').pipe(zip('plugins.zip')).pipe(gulp.dest('./build/dist/')));

gulp.task('watch', () => {
  webpack(Object.assign({watch: true}, require('./webpack.config.js'))).pipe(gulp.dest('./build/src'));
  gulp.watch(copySrcGlob, gulp.series('copy-src'));
  gulp.watch(lessFiles.concat('src/global.less'), gulp.series('build-css'));
  gulp.watch(['bundler.js'], gulp.series('plugins'));
  pluginArray.map(name => `${path.resolve(__dirname, 'plugins', name)}/**/*`).forEach((glob, idx) => {
    gulp.watch(glob, async () => await runBundler(pluginArray[idx]).catch(e => e));
  });
});

gulp.task('default', gulp.series(['build-css', 'copy-src', 'copy-deps'], 'watch'));
gulp.task('build', gulp.parallel(['build-js', 'build-css', 'copy-src', 'copy-deps']));
gulp.task('pack', gulp.series(['build', 'extension', 'plugins', 'pack-plugins']));

function versionTask(bumpType) {
  return () => gulp.src(['package.json', 'src/manifest.json'], {base: './'}).pipe(gulpBump({type: bumpType})).pipe(gulp.dest('./'));
}

gulp.task('patch', versionTask('patch'));
gulp.task('minor', versionTask('minor'));
gulp.task('major', versionTask('major'));
