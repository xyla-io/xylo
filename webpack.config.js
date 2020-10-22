'use strict';

let browserConfig = require('./config/webpack.browser.config');
let commonConfig = require('./config/webpack.common.config');
let workersConfig = require('./config/webpack.workers.config');

module.exports = (env, argv) => {
  return [
    browserConfig(env, argv),
    commonConfig(env, argv),
    workersConfig(env, argv),
  ];
};
