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
│   ├── bootstrap/       boostrap files for the app
│   ├── component/       components
│   ├── css/             not related to components css files
│   ├── demo/            demos of components/modules usage
│   ├── img/             not related to components images
│   ├── module/          modules
│   ├── test/            modules/components/ets tests are located there
│   │   ├─ component/
│   │   ├─ module/
│   │   ├─ bootsrap.js   a boostrap for tests
│   │   ├─ helpers.js    different helpers used in tests
│   │   └─ test.html     a main page for tests. It's needed due to ES6 modules
│   └── index.html       
├── web/                 public folder with copied/parsed/combined/etc files
│   ├── bootstrap/
│   ├── component/       
│   ├── css/             
│   ├── demo/        
│   ├── img/             
│   ├── js/              vendors files
│   ├── module/          
│   ├── test/            
│   └─── index.html
├── gulpfile.js
├── karma.conf.js  
├── LICENSE
├── package.json
└── README.md
```

## Usage

* Execute `npm run build` to build the app, lint it, put it into the `web` folder and test it
* Execute `npm run gulp` to build the app and put it into the `web` folder
* Execute `npm run lint` to lint the app
* Execute `npm run test` to test the app
* Execute `npm run watch` to build the app, put it into the `web` folder and watch for changes

## License

Apache License (Version 2.0, January 2004)

http://www.apache.org/licenses/
