'use strict';

require('global');
const async = require('async');
const buttonsUtil = require('buttons');

$(document).ready(() => {
  plugins.forEach(plugin => runViewContent(plugin, 'global'));
  plugins.forEach(plugin => runViewContent(plugin, 'main'));
  buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons')[0]));
});

// FIXME
let panels = [];
function addPanel(panelObject) {
  panels.push(panelObject);
  panels = panels.sort((a, b) => (a.position < b.position ? -1 : 1));
  const newPanelIndex = panels.indexOf(panelObject);
  const children = Array.from($('#data-collection').children());
  if (children.length === 0) {
    $('#data-collection').insertAdjacentHTML('afterbegin', panelObject.htmlContent);
  } else if (panels.length - 1 === newPanelIndex) {
    $('#data-collection').insertAdjacentHTML('beforeend', panelObject.htmlContent);
  } else {
    children.forEach((child, i) => {
      if (newPanelIndex === i) child.insertAdjacentHTML('beforebegin', panelObject.htmlContent);
    });
  }
}

$(document).on('keydown', e => {
  if (e.altKey) window.location.replace(buttons.find(button => button.hotkey.charCodeAt() === e.keyCode).href);
});
