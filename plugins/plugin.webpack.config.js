'use strict';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  module: {
    rules: [{
      test: /.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {presets: ['@babel/preset-env']}
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
