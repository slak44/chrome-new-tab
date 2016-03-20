'use strict';
var plugin = {
  name: 'Title',
  desc: 'Adds a title to the main page',
  author: 'Slak44',
  version: '1.0.2',
  preserveSettings: true,
  settings: [
    {
      name: 'Title text',
      desc: 'The text to be displayed',
      type: 'text',
      value: '',
      isVisible: true
    },
    {
      name: 'Position',
      desc: 'The text will be inserted after this many elements',
      type: 'number',
      value: '',
      isVisible: true
    }
  ],
  main: function (plugin) {
    addPanel({
      position: plugin.settings[1].value || 0,
      htmlContent:
      `<li id="title" class="collection-item bold">
        <h1>${plugin.settings[0].value}</h1>
      </li>`
    });
  }
};
/* jshint -W030*/
plugin;