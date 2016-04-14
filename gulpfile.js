'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const crx = require('gulp-crx-pack');
const sequence = require('gulp-sequence');
const copy = require('gulp-copy');
const gulpBrowser = require('gulp-browser');
const fs = require('fs');

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
    .pipe(copy('./build/src/', {prefix: 4}));
  callback();
});

gulp.task('copy-fonts', function (callback) {
  gulp.src('node_modules/materialize-css/dist/fonts/roboto/*')
    .pipe(copy('./build/src/fonts/roboto', {prefix: 5}));
  callback();
});

gulp.task('extension', function () {
  return gulp.src('./build/src')
    .pipe(crx({
      privateKey: fs.readFileSync('./ext.pem', 'utf8'),
      filename: 'ext.crx'
    }))
    .pipe(gulp.dest('./build/dist'));
});

gulp.task('default', sequence(['js-src', 'copy-src', 'copy-css', 'copy-fonts', 'extension']));
