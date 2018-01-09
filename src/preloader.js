'use strict';

require('storage');
const themeLoader = require('theme-loader');

storage.loadAll(() => {
  themeLoader.activateTheme(themes[currentThemeIdx] || require('json-loader!default-theme'));
});
