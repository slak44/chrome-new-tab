'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const crx = require('gulp-crx-pack');
const sequence = require('gulp-sequence');
const copy = require('gulp-copy');
const gulpBrowser = require('gulp-browser');
const gulpBump = require('gulp-bump');
const zip = require('gulp-zip');
const merge = require('merge-stream');
const fs = require('fs');
const cp = require('child_process');
const async = require('async');

gulp.task('materialize-bug-fix', function (done) {
  const libLocation = `${__dirname}/node_modules/pickadate/lib/picker.js`;
  const missingLibFile = `${__dirname}/node_modules/materialize-css/dist/js/picker.js`;
  
  fs.lstat(missingLibFile, function (err, stats) {
    if (err && err.code !== 'ENOENT') {
      done(err);
      return;
    }
    if (err.code === 'ENOENT' || !stats.isSymbolicLink()) {
      symlink();
    } else done();
  });
  
  function symlink() {
    fs.symlink(libLocation, missingLibFile, function (err) {
      if (err) throw err;
      done();
    });
  }
});

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
      cp.exec(`node bundler.js plugins/${folderName} build/plugins/${folderName}.json`, (err, stdout, stderr) => {
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

gulp.task('pack-plugins', function () {
  return gulp.src('./build/plugins/*')
    .pipe(zip('plugins.zip'))
    .pipe(gulp.dest('./build/dist/'));
});

gulp.task('default', sequence(['materialize-bug-fix', 'js-src', 'copy-src', 'copy-css', 'copy-fonts']));

gulp.task('all', sequence(['default', 'extension', 'plugins', 'pack-plugins']));

function createVersionTask(bumpType) {
  return function () {
    let packageJson =
    gulp.src('./package.json')
      .pipe(gulpBump({type: bumpType}))
      .pipe(gulp.dest('./'));
    let manifestJson =
    gulp.src('./src/manifest.json')
      .pipe(gulpBump({type: bumpType}))
      .pipe(gulp.dest('./src/'));
    return merge([packageJson, manifestJson]);
  };
}

gulp.task('patch', createVersionTask('patch'));
gulp.task('minor', createVersionTask('minor'));
gulp.task('major', createVersionTask('major'));
