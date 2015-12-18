'use strict';

/* Required */
/* -----------------------------------*/
var gulp          = require('gulp');
var postcss       = require('gulp-postcss');
var autoprefixer  = require('autoprefixer');
var sass          = require('gulp-sass');
var uglify        = require('gulp-uglify');
var concat        = require('gulp-concat');
var plumber       = require('gulp-plumber');
var sourcemaps    = require('gulp-sourcemaps');
var jade          = require('gulp-jade');
var bowerFiles    = require('bower-files')();
var del           = require('del');
var browserSync   = require('browser-sync');

var reload = browserSync.reload;


/**
  * Compile SASS to CSS
  * dest: /src/sass/main.sass -> /src/css/main.css
  * --------------------------------------------------- */
gulp.task('build-css', function() {
  var processors = [
    autoprefixer,
  ];
  return gulp.src('src/sass/main.sass')
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'})
      .on('error', sass.logError))
      .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/css/'))
    .pipe(reload({ stream: true }));
});


/**
  * Compile JADE to HTML
  * dest: /src/index.jade -> /src/index.html
  * --------------------------------------------------- */
gulp.task('build-html', function() {
  return gulp.src('src/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('src/'))
    .pipe(reload({ stream: true }));
});


/**
  * Move Bower components
  * JS dest: bower_components/<component-dir>/<component>.js -> /src/js/vendor/<component>.js
  * CSS dest: bower_components/<component-dir>/<component>.css -> /src/css/vendor/<component>.css
  * Fonts: bower_components/<component-dir>/fonts/* -> /src/css/fonts/*
  * --------------------------------------------------- */
gulp.task('bower:js', function() {
  return gulp.src(bowerFiles.ext('js').files)
    .pipe(gulp.dest('src/js/vendor/'))
});

gulp.task('bower:css', function() {
  return gulp.src(bowerFiles.ext('css').files)
    .pipe(gulp.dest('src/css/vendor/'));
});

gulp.task('bower:fonts', function() {
  return gulp.src('src/bower_components/font-awesome/fonts/**')
    .pipe(gulp.dest('src/css/fonts/'));
});

gulp.task('bower', ['bower:js', 'bower:css', 'bower:fonts']);


/**
  * Reload Browser on main.js changes
  * --------------------------------------------------- */
gulp.task('js', function() {
  return gulp.src('src/js/main.js')
    .pipe(reload({ stream: true }));
});

/* Build Tasks */
/* -----------------------------------*/

// 1 - Delete 'build' folder
gulp.task('build:delete', function(cb) {
  return del([
    'build/**'
  ], cb);
});

// 2 - Copy 'src' to 'build' folder
gulp.task('build:copy', ['build:delete'], function() {
  return gulp.src(['src/**/*', '!src/bower_components','!src/bower_components/**'])
    .pipe(gulp.dest('build/'));
});

// 3 - Remove unnecessary production files
gulp.task('build:clean', ['build:copy'], function(cb) {
  return del([
    'build/sass',
    'build/*.jade'
  ], cb);
});

// 4 - Build
gulp.task('build', ['build:copy', 'build:clean']);


/* Browser Sync */
/* -----------------------------------*/
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src/'
    }
  })
});

/* Browser Sync for Build */
/* -----------------------------------*/
gulp.task('build:serve', function() {
  browserSync({
    server: {
      baseDir: 'build/'
    }
  })
});


/* Watch Task */
/* -----------------------------------*/
gulp.task('watch', function() {
  gulp.watch('src/*.jade', ['build-html']);
  gulp.watch(['src/sass/**/*.sass', 'src/sass/**/*.scss', 'src/sass/**/*.css'], ['build-css']);
  gulp.watch('src/js/*.js', ['js']);
});


/* Overwite default task */
/* -----------------------------------*/
gulp.task('default', ['browser-sync', 'watch']);
