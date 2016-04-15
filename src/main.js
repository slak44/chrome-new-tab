'use strict';

Object.assign(window, require('./global.js'));
const async = require('async');

loadSchemes(() => {
  activateScheme(colorSchemes[0]);
  async.parallel(
    [loadButtons, loadPlugins],
    function (err, results) {
      if (err) throw err;
      runPlugins();
    }
  );
});

let panels = [];
function addPanel(panelObject) {
  panels.push(panelObject);
  panels = panels.sort((a, b) => a.position < b.position ? -1 : 1);
  let newPanelIndex = panels.indexOf(panelObject);
  let children = Array.from(byId('data-collection').children);
  if (children.length === 0) {
    byId('data-collection').insertAdjacentHTML('afterbegin', panelObject.htmlContent);
  } else if (panels.length - 1 === newPanelIndex) {
    byId('data-collection').insertAdjacentHTML('beforeend', panelObject.htmlContent);
  } else {
    children.forEach(function (e, i, array) {
      if (newPanelIndex === i) e.insertAdjacentHTML('beforebegin', panelObject.htmlContent);
    });
  }
}

document.onkeydown = function (e) {
  if (e.altKey) {
    for (let b in buttons) if (buttons[b].hotkey.charCodeAt() === e.keyCode) window.location.replace(buttons[b].href);
  }
};

function loadButtons(callback) {
  storage.load('buttons',
  function (error) {
    if (error) {
      createButton({text: 'Configure buttons here', href: '/secondary.html'});
    } else {
      let orderedButtons = [];
      for (let i in buttons) orderedButtons.push(buttons[i]);
      orderedButtons.sort((a, b) => Number(a.position) < Number(b.position) ? -1 : 1);
      orderedButtons.forEach(e => createButton({
          imagePath: e.imagePath,
          href: e.href,
          text: e.text,
          openInNew: e.openInNew
        }));
    }
    callback(null);
  });
}

function runPlugins() {
  Object.keys(plugins).forEach(pluginName => {
    /* jshint -W061 */
    try {
      if (plugins[pluginName].html.main) Object.keys(plugins[pluginName].html.main).forEach(function (selector, i, array) {
        byQSelect(selector).insertAdjacentHTML('beforeend', plugins[pluginName].html.main[selector]);
      });
      if (plugins[pluginName].css.main) pluginCss.innerHTML += plugins[pluginName].css.main;
      if (plugins[pluginName].js.main) eval(plugins[pluginName].js.main);
    } catch (err) {
      console.error(`Execution for ${pluginName} failed: `, err);
    }
  });
}
