'use strict';

var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

var path = {
  app: {
    scripts: "app/assets/scripts/",
    styles: "app/assets/styles/",
    images: "app/assets/images/",
    fonts: "app/assets/fonts/",
    partials: "app/partials/"
  },
  build: {
    scripts: "build/assets/scripts/",
    styles: "build/assets/styles/",
    images: "build/assets/images/",
    fonts: "build/assets/fonts/",
    partials: "build/partials/"
  },
  domain: ""
};

/**
 * Individual Tasks
 */
gulp.task('styles', function () {
  return gulp.src(path.app.styles + '*.scss')
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sass({outputStyle: 'expanded', precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer('last 2 version'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(path.app.styles))
    .pipe(browserSync.stream({match: "**/*.css"}))
});

//Serve for HTML
gulp.task('html', function () {
  browserSync({
    server: {
      baseDir: "app",
      routes: {
        "/vendor": "./vendor"
      }
    }
  });

});

//Serve for PHP
gulp.task('php', function () {
  $.connectPhp.server({
    base: 'app',
    port: 8000,
    keepalive: false
  }, function () {
    browserSync({
      proxy: '127.0.0.1:8000'
    });
  });

});

gulp.task('copy:scripts', function () {
  return gulp.src(path.app.scripts + '/**/*')
    .pipe(gulp.dest(path.build.scripts));
});

gulp.task('copy:styles', function () {
  return gulp.src(path.app.styles + 'main.css')
    .pipe(gulp.dest(path.build.styles));
});

gulp.task('copy:images', function () {
  return gulp.src(path.app.images + '**/*')
    .pipe(gulp.dest(path.build.images));
});

gulp.task('copy:fonts', function () {
  return gulp.src(path.app.fonts + '**/*')
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task('copy:partials', function () {
  return gulp.src(path.app.partials + '**/*')
    .pipe(gulp.dest(path.build.partials));
});

gulp.task('min:images', function () {
  gulp.src(path.build.images + '**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest(path.build.images))
});

/**
 * Serve Dev
 */
gulp.task('serve', function (cb) {
  runSequence(
    'styles',
    'php',//or just html
    cb
  );

  //Watch
  gulp.watch(path.app.styles + "**/*.scss", ['styles']);
  gulp.watch(path.app.scripts + "**/*.js").on('change', browserSync.reload);
  gulp.watch("app/**/*.html").on('change', browserSync.reload);
  gulp.watch("app/**/*.php").on('change', browserSync.reload);

});

/**
 * Build Production
 */
gulp.task('build', ['styles', 'copy:views', 'copy:scripts', 'copy:styles', 'copy:fonts', 'copy:images', 'min:images'], function () {
  return gulp.src(path.app.partials + '*.php')
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest(path.build.partials));
});


//TODO
// - Add lint JS/SCSS
// -