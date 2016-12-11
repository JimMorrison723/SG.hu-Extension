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

var commonFiles = [
	'./src/img/*/*',
	'./src/js/libs/*.*',
	'./src/js/*.*'
];

var chromeBuild = './dist/Chrome/',
	operaBuild = './dist/Opera/',
	firefoxBuild = './dist/Firefox/';

// use run-sequence if needed! 'jshint',
gulp.task('buildCommon', function () {
	return runSequence('clean:dist', 'move', 'concat');
});

gulp.task('buildFull', function () {
	return runSequence('buildCommon', ['chrome', 'opera', 'firefox'], 'clean:dist');
});

/* MOVE */
/* SAVED FOR LATER USE */
/*
 gulp.task('move', function () {
 return gulp.src(filesToMove, {base: './src/'})
 /*.pipe(gulpIf('js/libs/*.js', uglify({
 preserveComments: 'license'
 })))*
 .pipe(gulpIf('*.js', replace(/\$build:version/g, pjson.version)))
 .pipe(gulpIf('*.json', replace(/\$build:version/g, pjson.version)))
 .pipe(gulp.dest('dist/common'));
 /*.pipe(gulpIf('*.js', uglify()))
 .pipe(gulpIf('*.css', cssnano()))*
 });
 */

gulp.task('watch:chrome', function () {
	gulp.watch('src/js/*.js', ['chrome']);
	gulp.watch('src/css/*.css', ['chrome']);
});

/* BUILD FOR BROWSERS */

gulp.task('chrome', function () {
	// del.sync('dist/Chrome/');
	gulp.src(commonFiles, {base: './src/'})
		.pipe(gulpIf('*.js', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(chromeBuild));

	gulp.src('./src/css/*.css')
		.pipe(concat('all.css'))
		.pipe(gulp.dest('./dist/Chrome/css/'));

	return gulp.src(['./src/manifest.json'])
		.pipe(gulpIf('*.json', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Chrome')))
		.pipe(gulp.dest(chromeBuild));
});

gulp.task('opera', function () {
	// del.sync('dist/Opera/');
	gulp.src(commonFiles, {base: './src/'})
		.pipe(gulpIf('*.js', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(operaBuild));

	gulp.src('./src/css/*.css')
		.pipe(concat('all.css'))
		.pipe(gulp.dest('./dist/Opera/css/'));

	return gulp.src(['./src/manifest.json'])
		.pipe(gulpIf('*.json', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Opera')))
		.pipe(gulp.dest(operaBuild));
});

gulp.task('firefox', function () {
	// del.sync('dist/Firefox/');
	gulp.src(commonFiles, {base: './src/'})
		.pipe(gulpIf('*.js', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.js', replace(/chrome\.extension/g, 'chrome.runtime')))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(firefoxBuild));

	gulp.src('./src/css/*.css')
		.pipe(concat('all.css'))
		.pipe(gulp.dest('./dist/Firefox/css/'));

	return gulp.src(['./src/manifest.json'])
		.pipe(gulpIf('*.json', replace(/\$build:version/g, pjson.version)))
		.pipe(gulpIf('*.json', replace(/\$build:browser/g, 'Firefox')))
		.pipe(gulp.dest(firefoxBuild));
});

/* EXTRA */

gulp.task('jshint', function () {
	return gulp.src('src/js/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(stylish));
});

/* CLEAN AND ZIP */

gulp.task('zip', function () {
	gulp.src('dist/Chrome/**')
		.pipe(zip('chrome.zip'))
		.pipe(gulp.dest('dist'));

	return gulp.src('dist/Firefox/**')
		.pipe(zip('firefox.zip'))
		.pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function () {
	return del.sync('dist/');
});

gulp.task('clean:dist:chrome', function () {
	return del.sync('dist/Chrome');
});

gulp.task('clean:dist:opera', function () {
	return del.sync('dist/Opera');
});

gulp.task('clean:dist:firefox', function () {
	return del.sync('dist/Firefox');
});