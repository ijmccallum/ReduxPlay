const gulp = require('gulp');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const minify = require('gulp-minify');

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

/* TODO: minify
.pipe(minify({
			ext: {
				src:'.js',
				min:'.js'
			},
			mangle: false
		}))
		*/