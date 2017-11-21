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
var vendorFileName = 'vendors.js';

var paths = {
	html: baseOriginalPath + '/*.html',
	bootstrap: baseOriginalPath + '/bootstrap/**/*.*',
	component: [baseOriginalPath + '/component/**/'],
	css: [baseOriginalPath + '/css/*.css'],
	demo: [baseOriginalPath + '/demo/*.*'],
	img: [baseOriginalPath + '/img/*.*'],
	module: [baseOriginalPath + '/module/**/*.*'],
	test: [baseOriginalPath + '/test/**/'],
	vendors: ['node_modules/handlebars/dist/handlebars.runtime.js']
};

var outputPaths = {
	html: baseOutputPath + '/*.html',
	bootstrap: baseOutputPath + '/bootstrap',
	component: baseOutputPath + '/component',
	css: baseOutputPath + '/css',
	demo: baseOutputPath + '/demo',
	img: baseOutputPath + '/img',
	module: baseOutputPath + '/module',
	test: baseOutputPath + '/test',
	js: baseOutputPath + '/js'
}

gulp.task('watch', ['default'], function() {
	livereload.listen();
	gulp.watch(paths.html, ['copy:html']);
	gulp.watch(paths.bootstrap, ['copy:bootstrap']);
	gulp.watch(paths.component + '*.*', ['copy:component']);
	gulp.watch(paths.css, ['copy:css']);
	gulp.watch(paths.demo, ['copy:demo']);
	gulp.watch(paths.img, ['copy:img']);
	gulp.watch(paths.module, ['copy:module']);
	gulp.watch(paths.test + '*.*', ['copy:test']);
});

gulp.task('default', ['copy']);

gulp.task('clean', function () {
	return del([
		outputPaths.html,
		outputPaths.bootstrap,
		outputPaths.component,
		outputPaths.css,
		outputPaths.demo,
		outputPaths.img,
		outputPaths.module,
		outputPaths.test,
		outputPaths.js
	])
});

gulp.task('copy', ['copy:html', 'copy:bootstrap', 'copy:component', 'copy:asset', 'copy:demo', 'copy:module', 'copy:test', 'copy:vendor']);

gulp.task('copy:component', ['copy:component:js', 'copy:component:template', 'copy:component:other']);

gulp.task('copy:asset', ['copy:css', 'copy:img']);

gulp.task('copy:test', ['copy:test:all', 'copy:test:bootstrap']);

gulp.task('copy:html', function() {
	return gulp.src(paths.html)
		.pipe(newer(baseOutputPath))
		.pipe(gulp.dest(baseOutputPath))
		.pipe(livereload());
});

gulp.task('copy:bootstrap', function() {
	return gulp.src(paths.bootstrap)
		.pipe(newer(outputPaths.bootstrap))
		.pipe(gulp.dest(outputPaths.bootstrap))
		.pipe(livereload());
});

gulp.task('copy:component:js', function() {
	return gulp.src(paths.component + '*.js')
		.pipe(newer(outputPaths.component))
		.pipe(gulp.dest(outputPaths.component))
		.pipe(livereload());
});

// precompile all *.hbs files into *.js files
gulp.task('copy:component:template', function() {
	return gulp.src(paths.component + '*.hbs')
		.pipe(newer({dest: outputPaths.component, ext: '.js'}))
		.pipe(precompileHandlebars())
		.pipe(rename({extname: '.js'}))
		.pipe(defineModule('es6', {require: {Handlebars: null}}))
		.pipe(gulp.dest(outputPaths.component))
		.pipe(livereload());
});

gulp.task('copy:component:other', function() {
	var path = ['!' + paths.component + '*.js', '!' + paths.component + '*.hbs', paths.component + '*.*']
	return gulp.src(path)
		.pipe(newer(outputPaths.component))
		.pipe(gulp.dest(outputPaths.component))
		.pipe(livereload());
});

gulp.task('copy:css', function() {
	return gulp.src(paths.css)
		.pipe(newer(outputPaths.css))
		.pipe(gulp.dest(outputPaths.css))
		.pipe(livereload());
});

gulp.task('copy:demo', function() {
	return gulp.src(paths.demo)
		.pipe(newer(outputPaths.demo))
		.pipe(gulp.dest(outputPaths.demo))
		.pipe(livereload());
});

gulp.task('copy:img', function() {
	return gulp.src(paths.img)
		.pipe(newer(outputPaths.img))
		.pipe(gulp.dest(outputPaths.img))
		.pipe(livereload());
});

gulp.task('copy:module', function() {
	return gulp.src(paths.module)
		.pipe(newer(outputPaths.module))
		.pipe(gulp.dest(outputPaths.module))
		.pipe(livereload());
});

gulp.task('copy:test:all', function() {
	var path = ['!' + paths.test + 'bootstrap.js', paths.test + '*.*']
	return gulp.src(path)
		.pipe(newer(outputPaths.test))
		.pipe(gulp.dest(outputPaths.test));
});

// Import all test *.spec.js files into /test/bootstrap.js
gulp.task('copy:test:bootstrap', function() {
	return gulp.src(paths.test + 'bootstrap.js')
		.pipe(inject(gulp.src(paths.test + '*.spec.js', {read: false}), {
			starttag: '//tests start',
			endtag: '//tests end',
			ignorePath: "/" + baseOriginalPath,
			transform: function (filepath) {
				return 'import "' + filepath + '";';
			}
		}))
		.pipe(gulp.dest(outputPaths.test));
});

// combine all vendors into one /js/vendors.js file
gulp.task('copy:vendor', function() {
	return gulp.src(paths.vendors)
		.pipe(newer(outputPaths.js + '/' + vendorFileName))
		.pipe(sourcemaps.init())
			.pipe(concat(vendorFileName))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(outputPaths.js));
});