'use strict';

const overlay = byId('fade-overlay');
const panelId = plugins[pluginName].settings[0].value;
let timeSinceLastMove = 0;

setInterval(function () {
  timeSinceLastMove++;
  if (timeSinceLastMove > 10) overlay.classList.add('fading');
  if (panelId) byId('fade-featured-panel').innerHTML = byId('data-collection').children[panelId].innerHTML;
}, 1000);

document.addEventListener('mousemove', function (event) {
  timeSinceLastMove = 0;
  overlay.classList.remove('fading');
});
