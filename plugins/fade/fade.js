'use strict';

// The fade overlay must cover the whole page (nav + side-nav included) and detect
// activity across it, so it lives on the host (see main.js). This plugin, running
// in the shared sandbox iframe, configures that overlay, forwards activity seen
// inside the iframe, and mirrors the featured element(s) cloned from the iframe DOM.

const selector = api.setting('Featured Data');
const theme = stored.themes[stored.currentThemeIdx];

api.configureFade({
  delay: parseInt(api.setting('Fade Delay'), 10),
  background: theme.background,
  // If the theme is light, invert the overlay to get a dark background
  invert: !theme.isDark
});

setInterval(() => {
  if (!selector) return;
  try {
    const html = Array.from(document.querySelectorAll(selector)).map(el => el.outerHTML).join('');
    api.fadeFeatured(html);
  } catch (err) {
    console.error(`Selector error: ${err}`);
  }
}, 1000); // eslint-disable-line

$(document).on('mousemove keypress input click scroll', () => api.fadeActivity());
