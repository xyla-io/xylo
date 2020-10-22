# Usage as library
1. Add the package as an NPM dependency
  - Production deployment
    Add `"xylo": "https://github.com/xyla-io/xylo"` to dependencies in package.json
2. Register the WebWorker directory in the importing codebase
### Angular 2+
`angular.json`
```json
  "architect": {
    "build": {
      "options": {
        "assets": [
          {
            "glob": "*.worker.js",
            "input": "node_modules/xylo/dist/src",
            "output": "/"
          }
        ]
      }
    }
  }
```
# Local development
See package.json `"scripts"` section for available commands.

# Organization
The build steps and folder structure for this library are patterned after the solution 
https://www.antonmata.me/2017-04-04-web-workers-playing-nice-with-visual-studio-code%E2%80%99s-intellisense/

The basic skeleton looks like this:
```
├── config                      
│   ├── webpack.browser.config.js       # Webpack build config for src/browser
│   └── webpack.workers.config.js       # Webpack build config for src/workers
├── dist
│   └── src
│       ├── xylo.js                     # Webpack outputs browser bundle (main xylo library) here
│       └── xylo.worker.js              # Webpack outputs worker script(s) here (must add to the site's web assets)
├── src
│   ├── browser                         # Source directory for the xylo browser library
│   │   └── tsconfig.browser.json       # TypeScript compiler settings for browser library
│   ├── common                          # Source directory for shared modules
│   │   └── tsconfig.common.json        # TypeScript compiler settings for shared modules
│   ├── test
│   │   ├── karma.conf.js
│   │   └── karma_continuous.conf.js
│   └── workers                         # Source directory for web/service worker scripts
│       └── tsconfig.workers.json       # TypeScript compiler settings for workers
├── package.json
└── webpack.config.js                   # Main Webpack build config (calls sub-configurations in config/)
```