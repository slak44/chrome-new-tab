'use strict';

require('global');
const buttonsUtil = require('buttons');
const themesUtil = require('themes');

const alignments = ['left', 'center', 'right'];
pluginApi.insertView = (plugin, htmlElement, order, alignment) => {
  if (!alignments.includes(alignment)) throw Error(`Illegal allignment "${alignment}"; valid: ${alignments.join(' ')}`);
  if (!(htmlElement instanceof HTMLElement)) throw Error('The argument htmlElement must be of type HTMLElement');
  htmlElement.style.order = order;
  $(`#${alignment}`).append(htmlElement);
};

$(document).ready(() => {
  plugins.forEach(plugin => runViewContent(plugin, 'global'));
  plugins.forEach(plugin => runViewContent(plugin, 'main'));
  buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons')[0]));
});

$(document).on('keydown', e => {
  if (e.altKey) location.replace(
    buttons.find(button => button.hotkey && button.hotkey.toUpperCase().charCodeAt() === e.keyCode).href
  );
});
