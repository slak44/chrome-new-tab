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
    sandbox: path.join(__dirname, 'src', 'sandbox', 'sandbox.js'),
  },
  output: {
    filename: '[name].min.js'
  },
  module: {
    rules: [{
      test: /.js$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, 'src'),
      // NB: the host bundles are minified by the ES5-only babel-preset-minify +
      // uglify-js, so host source must avoid async/await (which would either need
      // regeneratorRuntime under ES5 targets, or ES6 output the minifiers reject).
      // Use .then() chains in host code instead. Plugin bundles target modern
      // Chrome separately (see plugins/plugin.webpack.config.js).
      options: {presets: ['@babel/preset-env', 'minify']}
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
