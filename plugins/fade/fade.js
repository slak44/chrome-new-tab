'use strict';

const util = new PluginUtil(pluginName);
const timeUnit = 1000; // Second

const overlay = byId('fade-overlay');
const panelId = util.getSetting('Featured Panel');
let timeSinceLastMove = 0;

setInterval(function () {
  timeSinceLastMove++;
  if (timeSinceLastMove > util.getSetting('Fade Delay')) overlay.classList.add('fading');
  if (panelId) byId('fade-featured-panel').innerHTML = byId('data-collection').children[panelId].innerHTML;
}, timeUnit);

function stopFade() {
  timeSinceLastMove = 0;
  overlay.classList.remove('fading');
}

document.addEventListener('mousemove', stopFade);
document.addEventListener('keypress', stopFade);
document.addEventListener('input', stopFade);
document.addEventListener('click', stopFade);
document.addEventListener('scroll', stopFade);
