'use strict';

const fadeDelay = 10;
const timeUnit = 1000; // Second

const overlay = byId('fade-overlay');
const panelId = plugins[pluginName].settings[0].value;
let timeSinceLastMove = 0;

setInterval(function () {
  timeSinceLastMove++;
  if (timeSinceLastMove > fadeDelay) overlay.classList.add('fading');
  if (panelId) byId('fade-featured-panel').innerHTML = byId('data-collection').children[panelId].innerHTML;
}, timeUnit);

document.addEventListener('mousemove', function (event) {
  timeSinceLastMove = 0;
  overlay.classList.remove('fading');
});
