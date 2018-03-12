'use strict';

import 'storage';
import {tryLoadingPrecompiledStyles, switchTheme} from 'theme-loader';

const themeLoaded = tryLoadingPrecompiledStyles();

storage.loadAll(() => {
  if (themeLoaded) return;
  const theme = themes[currentThemeIdx] || require('json-loader!default-theme');
  switchTheme(theme, true);
});
