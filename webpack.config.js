'use strict';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = {
  resolve: {
    modules: ['node_modules', 'src/node_modules']
  },
  entry: {
    preloader: path.join(__dirname, 'src', 'preloader.js'),
    main: path.join(__dirname, 'src', 'main', 'main.js'),
    settings: path.join(__dirname, 'src', 'settings', 'settings.js'),
  },
  output: {
    filename: '[name].min.js'
  },
  module: {
    rules: [{
      test: /.js$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, 'src'),
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
