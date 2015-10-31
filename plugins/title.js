'use strict';
var plugin = {
  name: 'Title',
  desc: 'Adds a title to the main page',
  author: 'Slak44',
  version: '1.0.0',
  settings: [{
    name: 'Title text',
    desc: 'The text to be displayed',
    type: 'text',
    value: '',
    isVisible: true
  }],
  main: function (plugin) {
    byId('data-collection').insertAdjacentHTML('afterbegin', '<li id="title" class="collection-item bold"><h1>' + plugin.settings[0].value + '</h1></li>');
  }
};
/* jshint -W030*/
plugin;