var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var del = require('del');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var replace = require('gulp-replace');
var pjson = require('./package.json');
const zip = require('gulp-zip');

var filesToMove = [
    './src/css/*.*',
    './src/img/*/*',
    './src/js/libs/*.*',
    './src/js/*.*',
    './src/manifest.json'
];

var commonFilesToMove = [
    './dist/common/css/*.*',
    './dist/common/img/*/*',
    './dist/common/js/libs/*.*',
    './dist/common/js/*.*'
];

gulp.task('common_build', ['move', 'concat'], function () {
    console.log('Building files...');
});

// use run-sequence if needed! 'jshint',
gulp.task('preBuild', ['hello', 'clean:dist:common', 'moveThenConcat'], function (callback) {
    return gulp.start('clean:dist:lib');
});

gulp.task('buildFull', function (callback) {
    return runSequence('preBuild', ['chrome', 'opera', 'firefox'], 'clean:dist', callback);
});

/* MOVE */
gulp.task('moveThenConcat', ['concat'] ,function () {
    return true;
});

gulp.task('concat', ['move'] ,function () {
    return gulp.src('./dist/common/css/*.css')
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./dist/common/css/'));
});

gulp.task('move', function () {
    return gulp.src(filesToMove, {base: './src/'})
        .pipe(gulpIf('js/libs/*.js', uglify({
            preserveComments: 'license'
        })))
        .pipe(gulpIf('*.js', replace(/\$build:version/g, pjson.version)))
        .pipe(gulpIf('*.json', replace(/\$build:version/g, pjson.version)))
        .pipe(gulp.dest('dist/common'));
    /*.pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))*/
});

gulp.task('watch', function(){
    gulp.watch('src/js/*.js', ['moveThenConcat']);
    gulp.watch('src/css/*.css', ['moveThenConcat']);
});

/* BUILD FOR BROWSERS */

gulp.task('chrome', function () {
    // del.sync('dist/Chrome/');
    gulp.src(commonFilesToMove, {base: './dist/common/'})
        .pipe(gulp.dest('dist/Chrome'));

    return gulp.src(['./dist/common/manifest.json'])
        .pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Chrome')))
        .pipe(gulp.dest('./dist/Chrome'));
});

gulp.task('opera', function () {
    // del.sync('dist/Opera/');
    gulp.src(commonFilesToMove, {base: './dist/common/'})
        .pipe(gulp.dest('dist/Opera'));

    return gulp.src(['./dist/common/manifest.json'])
        .pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Opera')))
        .pipe(gulp.dest('./dist/Opera'));
});

gulp.task('firefox', function () {
    // del.sync('dist/Firefox/');
    gulp.src(commonFilesToMove, {base: './dist/common/'})
        .pipe(gulpIf('*.js', replace(/chrome\.extension/g, 'chrome.runtime')))
        .pipe(gulp.dest('dist/Firefox'));

    return gulp.src(['./dist/common/manifest.json'])
        .pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Firefox')))
        .pipe(gulp.dest('./dist/Firefox'));
});

/* EXTRA - CLEAN AND STUFF */

gulp.task('zip', function() {
    gulp.src('dist/Chrome/**')
        .pipe(zip('chrome.zip'))
        .pipe(gulp.dest('dist'));

    return gulp.src('dist/Firefox/**')
        .pipe(zip('firefox.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function () {
    return gulp.src('src/js/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('clean:dist:common', function () {
    return del.sync('dist/common/');
});

gulp.task('clean:dist:lib', function () {
    return del.sync(['dist/common/css/cleditor.css','dist/common/css/content.css','dist/common/css/settings.css']);
});

gulp.task('hello', function () {
    console.log('Building source to /dist/common folder...');
    // /"version": "(.*)"/
    return console.log("Version: " + pjson.version);
});