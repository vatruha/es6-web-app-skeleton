# es6-web-app-skeleton

The skeleton of a web application with native ES6 custom elements, ES6 modules, ES6 features and unit tests.

Features:
 * There are no polyfills included in this skeleton. That is why you have to use Chrome Headless for testing.
 * Handlebars.js is used for templating. Template literals are not very useful for that.
 * Gulp is used as a build system.
 * Testing stack: Karma, Mocha, Chai, Sinon.

## Installation

Execute `git clone https://github.com/vatruha/es6-web-app-skeleton.git` to clone this project.
### Directory structure
```
.
├── app/                 location of js application
│   ├── bootstrap/       boostrap files for the app and tests
│   ├── component/       components
│   ├── css/             not related to components css files
│   ├── examples/        examples of components/modules usage
│   ├── img/             not related to components images
│   ├── module/          modules
│   ├── test/            modules/components/ets tests are located there
│   ├── index.html       
│   └── test.html        this file is used in mocha for tests
├── web/                 public folder with copied/parsed/combined/etc files
│   ├── component/       
│   ├── css/             
│   ├── examples/        
│   ├── img/             
│   ├── js/              bootstrap and vendors files
│   ├── module/          
│   ├── test/            
│   ├── index.html
│   └── test.html
├── gulpfile.js
├── karma.conf.js  
├── LICENSE
├── package.json
└── README.md
```

## Usage

* Execute `gulp clean && gulp watch` to run gulp 
* Execute `npm run test` to run tests

## License

Apache License (Version 2.0, January 2004)

http://www.apache.org/licenses/
