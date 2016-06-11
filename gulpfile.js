'use strict';

const gulp = require('gulp');
const sequence = require('gulp-sequence');
const copy = require('gulp-copy');
const fs = require('fs');

gulp.task('materialize-bug-fix', done => {
  const libLocation = `${__dirname}/node_modules/pickadate/lib/picker.js`;
  const missingLibFile = `${__dirname}/node_modules/materialize-css/bin/picker.js`;
  
  fs.lstat(missingLibFile, (err, stats) => {
    if (err && err.code !== 'ENOENT') {
      done(err);
      return;
    }
    if ((err && err.code === 'ENOENT') || !stats.isSymbolicLink()) {
      symlink();
    } else done();
  });
  
  function symlink() {
    fs.symlink(libLocation, missingLibFile, err => {
      if (err) throw err;
      done();
    });
  }
});

gulp.task('build-js', () => {
  const babel = require('gulp-babel');
  const gulpBrowser = require('gulp-browser');
  return gulp.src(['src/*.js', 'src/**/*.js'], {base: './'})
    .pipe(babel())
    .pipe(gulpBrowser.browserify())
    .pipe(gulp.dest('./build/'));
});

gulp.task('copy-src', () =>
  gulp.src(['src/*', 'src/**/*', '!src/*.js', '!src/**/*.js'])
    .pipe(copy('./build/src', {prefix: 1}))
);

gulp.task('copy-materialize-css', () =>
  gulp.src('node_modules/materialize-css/dist/css/materialize.min.css')
    .pipe(copy('./build/src', {prefix: 4}))
);

gulp.task('copy-fonts', () =>
  gulp.src('node_modules/materialize-css/dist/fonts/roboto/*')
    .pipe(copy('./build/src/fonts/roboto', {prefix: 5}))
);

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

gulp.task('default', ['materialize-bug-fix', 'build-js', 'copy-src', 'copy-materialize-css', 'copy-fonts']);

gulp.task('default-watch', () => {
  gulp.watch(['src/*.js', 'src/**/*.js'], ['build-js']);
  gulp.watch(['src/*', 'src/**/*', '!src/*.js', '!src/**/*.js'], ['copy-src']);
});

gulp.task('all', sequence(['default', 'extension', 'plugins', 'pack-plugins']));

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
