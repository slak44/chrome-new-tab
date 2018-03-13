'use strict';

const selector = api.setting('Featured Data');

$('#fade-overlay').css('background-color', stored.themes[stored.currentThemeIdx].background);
// If the theme is light, invert it to get a dark background
if (!stored.themes[stored.currentThemeIdx].isDark) $('#fade-overlay').addClass('invert');

let timeSinceLastMove = 0;
setInterval(() => {
  timeSinceLastMove++;
  if (timeSinceLastMove > api.setting('Fade Delay')) $('#fade-overlay').addClass('fading');
  try {
    if (selector) {
      $('#fade-featured').empty();
      $('#fade-featured').html($(selector).clone());
    }
  } catch (err) {
    console.error(`Selector error: ${err}`);
  }
}, 1000); // eslint-disable-line

$(document).on('mousemove keypress input click scroll', () => {
  timeSinceLastMove = 0;
  $('#fade-overlay').removeClass('fading');
});
