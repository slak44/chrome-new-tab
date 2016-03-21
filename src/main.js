'use strict';
loadSchemes(() => {
  activateScheme(colorSchemes[0]);
  async.parallel([loadButtons, loadPlugins],
    loadPlugins);
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

function loadButtons(cb) {
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
    cb();
  });
}

function loadPlugins() {
  document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
  window.pluginCss = byId('plugin-css');
  storage.load('plugins',
  function (error) {
    Object.keys(plugins).forEach(function (plugin, i, array) {
      console.log(`Executing plugin: ${plugins[plugin].name}`);
      /*jshint -W061*/
      try {
        if (plugins[plugin].main) eval(`(${plugins[plugin].main})`)(plugins[plugin]);
      } catch (err) {
        console.error('Execution failed: ', err);
      }
    });
    if (error) console.log('No plugins executed.');
  });
}
