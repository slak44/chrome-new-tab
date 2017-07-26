'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    main: path.join(__dirname, 'src', 'main', 'main.js'),
    secondary: path.join(__dirname, 'src', 'secondary', 'secondary.js'),
  },
  output: {
    filename: '[name]/[name].min.js'
  },
  module: {
    loaders: [{
      test: /.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {presets: ['latest']}
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
  ]
};
