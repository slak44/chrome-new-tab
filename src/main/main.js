'use strict';

import 'global';
import {sorted as sortedButtons, insertButton} from 'buttons';
import PluginHost from 'plugin-host';

// ---- activity nav chrome ---------------------------------------------------
// The activity stack lives inside the sandbox iframe; the host only reflects the
// current activity's title and shows a back button when one can be popped.
function onActivityState(title, canGoBack) {
  $('.activity-title').text(title);
  $('.activity-up-btn').toggleClass('hidden', !canGoBack);
}
$('.activity-up-btn').click(() => PluginHost.requestBack());

// ---- host-side fade overlay ------------------------------------------------
// The overlay must cover the whole page (including the nav and side-nav) and
// detect activity across it, so it lives on the host. The fade plugin (running
// in the iframe) configures it, forwards in-iframe activity, and streams the
// featured element's HTML cloned from the shared iframe DOM.
const fadeCss = `
  #fade-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; opacity: 0; z-index: 99999;
  }
  #fade-overlay.fading { animation: darken 20s linear 0s 1 normal forwards running; }
  @keyframes darken { 0% {opacity: 0;} 100% {opacity: 1;} }
  #fade-featured {
    display: flex; flex-flow: column; justify-content: center; align-items: center;
    width: 100%; height: 100%;
  }
  #fade-featured > * { font-size: 300% !important; text-align: center !important; float: none !important; }
  #fade-overlay.invert { filter: invert(100%); }
`;
let fadeOverlay = null;
let fadeFeatured = null;
let fadeSeconds = 0;
let fadeDelay = Infinity;

function resetFade() {
  fadeSeconds = 0;
  if (fadeOverlay) fadeOverlay.classList.remove('fading');
}

function setupFade(cfg) {
  fadeDelay = cfg.delay;
  if (!fadeOverlay) {
    $('head').append(`<style>${fadeCss}</style>`);
    fadeOverlay = document.createElement('div');
    fadeOverlay.id = 'fade-overlay';
    fadeFeatured = document.createElement('div');
    fadeFeatured.id = 'fade-featured';
    fadeOverlay.appendChild(fadeFeatured);
    document.body.appendChild(fadeOverlay);
    setInterval(() => {
      fadeSeconds++;
      if (fadeSeconds > fadeDelay) fadeOverlay.classList.add('fading');
    }, 1000);
    $(document).on('mousemove keypress input click scroll', resetFade);
  }
  fadeOverlay.style.backgroundColor = cfg.background;
  fadeOverlay.classList.toggle('invert', !!cfg.invert);
}

// ---- plugins + buttons -----------------------------------------------------
let buttonsLoaded = false;
storage.loadCached(storage.cacheable.buttons).then(buttonsText => {
  if (buttonsText === null) return;
  buttonsLoaded = true;
  stored.buttons = JSON.parse(buttonsText);
  stored.buttons.forEach(button => insertButton(button, $('#buttons')[0]));
});

storageLoad.then(() => {
  // Init here (not at module load) so the sandbox is seeded only once `stored` is ready.
  PluginHost.init({
    frameHost: $('main.activity')[0],
    onActivityState,
    onFadeConfig: setupFade,
    onFadeActivity: resetFade,
    onFadeFeatured: html => { if (fadeFeatured) fadeFeatured.innerHTML = html; }
  });
  PluginHost.run(stored.plugins, ['global', 'main']);
  if (!buttonsLoaded) {
    const sorted = sortedButtons();
    sorted.forEach(button => insertButton(button, $('#buttons')[0]));
    storage.storeCached(storage.cacheable.buttons, JSON.stringify(sorted));
  }
});

$(document).on('keydown', e => {
  if (e.altKey) location.replace(
    stored.buttons.find(button => button.hotkey && button.hotkey.toUpperCase().charCodeAt() === e.keyCode).href
  );
});
