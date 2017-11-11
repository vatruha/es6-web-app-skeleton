// Karma configuration
// Generated on Mon Oct 02 2017 22:23:41 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
			{pattern: 'web/**/*.js', watched: false, included: false, served: true, nocache: false},
			{pattern: 'web/**/*.json', watched: false, included: false, served: true, nocache: false},
			{pattern: 'web/img/**/*.*', watched: false, included: false, served: true, nocache: false},
			'web/test.html'
		],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    // singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

		proxies: {
    	'/js/': '/base/web/js/',
			'/module/': '/base/web/module/',
			'/component/': '/base/web/component/',
			'/test/': '/base/web/test/',
			'/img/': '/base/web/img/'
		}
  })
}
