'use strict';

import 'storage';
import activateTheme from 'theme-loader';

storage.loadAll(() => {
  activateTheme(themes[currentThemeIdx] || require('json-loader!default-theme'));
});
