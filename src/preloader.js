'use strict';

import 'storage';
import {tryLoadingPrecompiledStyles, switchTheme} from 'theme-loader';

const themeLoaded = storage.loadCached(storage.cacheable.precompiledStyles, styleText => {
  document.getElementById('dynamic-colors').innerText = styleText;
});

storage.loadAll(() => {
  if (themeLoaded) return;
  const theme = themes[currentThemeIdx] || require('json-loader!default-theme');
  switchTheme(theme, true);
});
