var gulp = require('gulp');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var defineModule = require('gulp-define-module');
var precompileHandlebars = require('gulp-precompile-handlebars');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var newer = require('gulp-newer');
var del = require('del');
var inject = require('gulp-inject');

var baseOriginalPath = 'app';
var baseOutputPath = 'web';

var paths = {
	html: [baseOriginalPath + '/index.html', baseOriginalPath + '/test.html'],
	examples: [baseOriginalPath + '/examples/*.*'],
	css: [baseOriginalPath + '/css/*.css'],
	img: [baseOriginalPath + '/img/*.*'],
	bootstrapDir: baseOriginalPath + '/bootstrap',
	bootstrapFiles: [baseOriginalPath + '/bootstrap/**/*.js'],
	module: [baseOriginalPath + '/module/**/*.js'],
	component: [baseOriginalPath + '/component/**/*.js'],
	template: [baseOriginalPath + '/component/**/*.hbs'],
	test: [baseOriginalPath + '/test/**/*.js', baseOriginalPath + '/test/**/*.json'],
	testSpec: [baseOriginalPath + '/test/**/*.spec.js']
};

var outputPaths = {
	htmlFiles: baseOutputPath + '/*.html',
	examples: baseOutputPath + '/examples',
	css: baseOutputPath + '/css',
	img: baseOutputPath + '/img',
	js: baseOutputPath + '/js',
	module: baseOutputPath + '/module',
	component: baseOutputPath + '/component',
	test: baseOutputPath + '/test',
	vendorFile: baseOutputPath + '/js/vendors.js'
}

gulp.task('watch', ['default'], function() {
	livereload.listen();
	gulp.watch(paths.html, ['copy:html']);
	gulp.watch(paths.examples, ['copy:examples']);
	gulp.watch(paths.css, ['copy:css']);
	gulp.watch(paths.img, ['copy:img']);
	gulp.watch(paths.bootstrapFiles, ['copy:bootstraps']);
	gulp.watch(paths.module, ['copy:modules']);
	gulp.watch(paths.component, ['copy:components']);
	gulp.watch(paths.template, ['compile-component-templates']);
	gulp.watch(paths.test, ['copy:tests', 'copy:bootstrapTest']);
});

gulp.task('default', ['compile-component-templates', 'copy']);

gulp.task('clean', function () {
	return del([
		outputPaths.htmlFiles,
		outputPaths.css,
		outputPaths.img,
		outputPaths.js,
		outputPaths.module,
		outputPaths.component,
		outputPaths.test
	])
});

gulp.task('copy', ['copy:html', 'copy:css', 'copy:img', 'copy:bootstraps', 'copy:modules', 'copy:components', 'copy:vendors', 'copy:tests']);

gulp.task('compile-component-templates', function() {
	return gulp.src(paths.template)
		.pipe(newer({dest: outputPaths.component, ext: '.js'}))
		.pipe(precompileHandlebars())
		.pipe(rename({ extname: '.js' }))
		.pipe(defineModule('es6', {require: {Handlebars: null}}))
		.pipe(gulp.dest(outputPaths.component))
		.pipe(livereload());
});

gulp.task('copy:html', function() {
	return gulp.src(paths.html)
		.pipe(newer(baseOutputPath))
		.pipe(gulp.dest(baseOutputPath))
		.pipe(livereload());
});

gulp.task('copy:examples', function() {
	return gulp.src(paths.examples)
		.pipe(newer(outputPaths.examples))
		.pipe(gulp.dest(outputPaths.examples))
		.pipe(livereload());
});

gulp.task('copy:css', function() {
	return gulp.src(paths.css)
		.pipe(newer(outputPaths.css))
		.pipe(gulp.dest(outputPaths.css))
		.pipe(livereload());
});

gulp.task('copy:img', function() {
	return gulp.src(paths.img)
		.pipe(newer(outputPaths.img))
		.pipe(gulp.dest(outputPaths.img))
		.pipe(livereload());
});

gulp.task('copy:bootstraps', ['copy:bootstrap', 'copy:bootstrapTest']);

gulp.task('copy:bootstrap', function() {
	return gulp.src(paths.bootstrapDir + '/bootstrap.js')
		.pipe(gulp.dest(outputPaths.js))
		.pipe(livereload());
});

gulp.task('copy:bootstrapTest', function() {
	return gulp.src(paths.bootstrapDir + '/bootstrapTest.js')
		.pipe(inject(gulp.src(paths.testSpec, {read: false}), {
			starttag: '//tests start',
			endtag: '//tests end',
			ignorePath: "/" + baseOriginalPath,
			transform: function (filepath) {
				return 'import "' + filepath + '";';
			}
		}))
		.pipe(gulp.dest(outputPaths.js))
		.pipe(livereload());
});

gulp.task('copy:modules', function() {
	return gulp.src(paths.module)
		.pipe(newer(outputPaths.module))
		.pipe(gulp.dest(outputPaths.module))
		.pipe(livereload());
});

gulp.task('copy:components', function() {
	return gulp.src(paths.component)
		.pipe(newer(outputPaths.component))
		.pipe(gulp.dest(outputPaths.component))
		.pipe(livereload());
});

gulp.task('copy:vendors', function() {
	return gulp.src('node_modules/handlebars/dist/handlebars.runtime.js')
		.pipe(newer(outputPaths.vendorFile))
		.pipe(sourcemaps.init())
			.pipe(concat('vendors.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(outputPaths.js));
});

gulp.task('copy:tests', function() {
	return gulp.src(paths.test)
		.pipe(gulp.dest(outputPaths.test));
});