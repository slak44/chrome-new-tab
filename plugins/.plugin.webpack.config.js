'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
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
