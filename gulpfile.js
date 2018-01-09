'use strict';

const gulp = require('gulp');
const sequence = require('gulp-sequence');
const webpack = require('webpack-stream');
const fs = require('fs');

gulp.task('build-js', () => {
  webpack(require('./webpack.config.js')).pipe(gulp.dest('./build/src'));
});

const copySrcGlob = [
  'src/global.css',
  'src/main/main.css',
  'src/main/main.html',
  'src/secondary/secondary.css',
  'src/secondary/secondary.html',
  'src/manifest.json'
];
gulp.task('copy-src', () =>
  gulp.src(copySrcGlob).pipe(gulp.dest('./build/src'))
);

gulp.task('copy-deps', () => {
  gulp.src('node_modules/materialize-css/dist/css/materialize.min.css')
    .pipe(gulp.dest('./build/src'));
  gulp.src('node_modules/materialize-css/dist/fonts/roboto/*')
    .pipe(gulp.dest('./build/src/fonts/roboto'));
  gulp.src('node_modules/material-design-icons/iconfont/*')
    .pipe(gulp.dest('./build/src/fonts/material-design-icons'));
});

gulp.task('extension', () => {
  const crx = require('gulp-crx-pack');
  let pKey;
  try {
    // This doesn't have to exist
    pKey = fs.readFileSync('./ext.pem', 'utf8');
  } catch (e) {
    pKey = undefined;
  }
  return gulp.src('./build/src')
    .pipe(crx({
      privateKey: pKey,
      filename: 'ext.crx'
    }))
    .pipe(gulp.dest('./build/dist'));
});

gulp.task('plugins', done => {
  const cp = require('child_process');
  const async = require('async');
  try {
    fs.mkdirSync('./build/plugins');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  fs.readdir('./plugins', (err, folders) => {
    if (err) throw err;
    const bundleTasks = folders.map(folderName => callback => {
      // If there are other things there, ignore them
      if (folderName.startsWith('.')) {
        callback(null);
        return;
      }
      cp.exec(`node bundler.js plugins/${folderName} build/plugins/${folderName}.json`, (err, stdout, stderr) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, stdout.toString());
      });
    });
    async.parallel(bundleTasks, (err, results) => {
      if (err) throw err;
      done();
    });
  });
});

gulp.task('pack-plugins', () => {
  const zip = require('gulp-zip');
  return gulp.src('./build/plugins/*')
    .pipe(zip('plugins.zip'))
    .pipe(gulp.dest('./build/dist/'));
});

gulp.task('watch', () => {
  gulp.watch(copySrcGlob, ['copy-src']);
  gulp.watch(['bundler.js', 'plugins/**/*', '!plugins/**/TEMP_PLUGIN_FILE'], ['plugins']);
  webpack(Object.assign({watch: true}, require('./webpack.config.js'))).pipe(gulp.dest('./build/src'));
});

gulp.task('default', sequence(['copy-src', 'copy-deps'], 'watch'));

gulp.task('build', ['build-js', 'copy-src', 'copy-deps']);
gulp.task('all', sequence(['build', 'extension', 'plugins', 'pack-plugins']));

function createVersionTask(bumpType) {
  const merge = require('merge-stream');
  const gulpBump = require('gulp-bump');
  return () => {
    const packageJson =
    gulp.src('./package.json')
      .pipe(gulpBump({type: bumpType}))
      .pipe(gulp.dest('./'));
    const manifestJson =
    gulp.src('./src/manifest.json')
      .pipe(gulpBump({type: bumpType}))
      .pipe(gulp.dest('./src/'));
    return merge([packageJson, manifestJson]);
  };
}

gulp.task('patch', createVersionTask('patch'));
gulp.task('minor', createVersionTask('minor'));
gulp.task('major', createVersionTask('major'));
