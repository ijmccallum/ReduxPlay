const gulp = require('gulp');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const browserify = require('browserify');

gulp.task('default', () => {
	return browserify('./src/main.js')
		.transform('babelify', {presets: ['es2015']})
		.bundle()
		.on('error', (e) => {
			gutil.log(e);
		})
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('dist/'));
});