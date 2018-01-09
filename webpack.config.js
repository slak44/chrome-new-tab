'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  resolve: {
    modules: ['node_modules', 'src/node_modules']
  },
  entry: {
    main: path.join(__dirname, 'src', 'main', 'main.js'),
    secondary: path.join(__dirname, 'src', 'secondary', 'secondary.js'),
  },
  output: {
    filename: '[name].min.js'
  },
  module: {
    loaders: [{
      test: /.js$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, 'src'),
      query: {presets: ['latest']}
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      exclude: [/\.min\.js$/gi]
    })
  ]
};
