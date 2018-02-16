'use strict';

const baseConfig = require('../plugin.webpack.config.js');
baseConfig.resolve = {
  mainFields: ['main']
};

module.exports = baseConfig;
