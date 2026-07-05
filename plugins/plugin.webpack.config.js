'use strict';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  module: {
    rules: [{
      test: /.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      // Target modern Chrome so plugin async/await runs natively inside the
      // sandbox (no regeneratorRuntime, which the sandbox doesn't provide).
      options: {presets: [['@babel/preset-env', {targets: {chrome: '90'}}]]}
    }]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        include: [/src\//]
      })
    ]
  }
};
