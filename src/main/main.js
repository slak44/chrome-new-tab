'use strict';

require('global');
const async = require('async');
const buttonsUtil = require('buttons');

async.parallel([loadButtons, loadPlugins], (err, results) => {
  if (err) throw err;
  plugins.forEach(plugin => runViewContent(plugin, 'main'));
});

let panels = [];
function addPanel(panelObject) {
  panels.push(panelObject);
  panels = panels.sort((a, b) => (a.position < b.position ? -1 : 1));
  const newPanelIndex = panels.indexOf(panelObject);
  const children = Array.from(byId('data-collection').children);
  if (children.length === 0) {
    byId('data-collection').insertAdjacentHTML('afterbegin', panelObject.htmlContent);
  } else if (panels.length - 1 === newPanelIndex) {
    byId('data-collection').insertAdjacentHTML('beforeend', panelObject.htmlContent);
  } else {
    children.forEach((child, i) => {
      if (newPanelIndex === i) child.insertAdjacentHTML('beforebegin', panelObject.htmlContent);
    });
  }
}

document.onkeydown = function (e) {
  if (e.altKey) window.location.replace(buttons.find(button => button.hotkey.charCodeAt() === e.keyCode).href);
};

function loadButtons(callback) {
  storage.load('buttons', err => {
    if (err) {
      console.error(err);
      // FIXME replace with default value for buttons array
      // createButton({text: 'Configure buttons here', href: '/secondary/secondary.html'});
    } else {
      buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons')[0]));
    }
    callback(null);
  });
}
