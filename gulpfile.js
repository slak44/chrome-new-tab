'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const crx = require('gulp-crx-pack');
const sequence = require('gulp-sequence');
const copy = require('gulp-copy');
const gulpBrowser = require('gulp-browser');
const fs = require('fs');
const cp = require('child_process');
const async = require('async');

gulp.task('js-src', function (callback) {
  gulp.src('src/*.js')
    .pipe(babel())
    .pipe(gulpBrowser.browserify())
    .pipe(gulp.dest('./build/src'));
  callback();
});

gulp.task('copy-src', function (callback) {
  gulp.src(['src/*', '!src/*.js'])
    .pipe(copy('./build/src', {prefix: 1}));
  callback();
});

gulp.task('copy-css', function (callback) {
  gulp.src('node_modules/materialize-css/dist/css/materialize.min.css')
    .pipe(copy('./build/src', {prefix: 4}));
  callback();
});

gulp.task('copy-fonts', function (callback) {
  gulp.src('node_modules/materialize-css/dist/fonts/roboto/*')
    .pipe(copy('./build/src/fonts/roboto', {prefix: 5}));
  callback();
});

gulp.task('extension', function () {
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

gulp.task('plugins', function (done) {
  fs.readdir('./plugins', function (err, folders) {
    if (err) throw err;
    let bundleTasks = folders.map(folderName => function (callback) {
      // If there are other things there, ignore them
      if (folderName.startsWith('.')) {
        callback(null);
        return;
      }
      cp.exec(`node bundler.js plugins/${folderName}`, (err, stdout, stderr) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, stdout.toString());
      });
    });
    async.parallel(bundleTasks, function (err, results) {
      if (err) throw err;
      done();
    });
  });
});

gulp.task('default', sequence(['js-src', 'copy-src', 'copy-css', 'copy-fonts']));

gulp.task('all', sequence(['js-src', 'copy-src', 'copy-css', 'copy-fonts', 'extension', 'plugins']));
