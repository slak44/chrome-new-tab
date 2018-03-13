'use strict';

import 'storage';
import {switchTheme} from 'theme-loader';

let themeLoaded = false;
storage.loadCached(storage.cacheable.precompiledStyles).then(styleText => {
  if (styleText === null) return;
  themeLoaded = true;
  document.getElementById('dynamic-colors').innerText = styleText;
});

window.storageLoad = storage.loadAll().then(items => {
  if (themeLoaded) return items;
  const theme = stored.themes[stored.currentThemeIdx] || require('json-loader!default-theme');
  switchTheme(theme, true);
  return items;
});
