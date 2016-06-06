'use strict';

require('./src/global.js');
const async = require('async');

loadSchemes(() => {
  activateScheme(colorSchemes[0]);
  async.parallel(
    [loadButtons, loadPlugins],
    (err, results) => {
      if (err) throw err;
      runPlugins();
    }
  );
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
  if (e.altKey) {
    for (const b in buttons) if (buttons[b].hotkey.charCodeAt() === e.keyCode) window.location.replace(buttons[b].href);
  }
};

function createButton(options) {
  if (options.parent && !(options.parent instanceof HTMLElement)) throw new Error('options.parent must be a HTMLElement');
  const parent = options.parent || byId('buttons');
  parent.insertAdjacentHTML('beforeend',
	`<li class="waves-effect waves-light collection-item">
		<a href="${options.href || ''}" class="button-link">
			<div class="valign-wrapper">
				<div class="button-image-wrapper">
          ${options.imagePath ?
            `<img src="${options.imagePath}"/>` :
            '<i class="material-icons">send</i>'}
        </div>
				<div class="valign thin button-text">${options.text}</div>
			</div>
		</a>
	</li>`
	);
  const anchor = parent.children[parent.children.length - 1];
  if (options.href !== undefined && (options.href.indexOf('chrome://') === 0 || options.openInNew))
    anchor.addEventListener('click', event => {
      chrome.tabs.create({url: options.href});
      window.close();
    });
  return anchor;
}

function loadButtons(callback) {
  storage.load('buttons',
  err => {
    if (err) {
      createButton({text: 'Configure buttons here', href: '/secondary/secondary.html'});
    } else {
      const orderedButtons = [];
      for (const i in buttons) orderedButtons.push(buttons[i]);
      orderedButtons.sort((a, b) => (Number(a.position) < Number(b.position) ? -1 : 1));
      orderedButtons.forEach(e => createButton(e));
    }
    callback(null);
  });
}

function runPlugins() {
  Object.keys(plugins).forEach(pluginName => {
    try {
      if (plugins[pluginName].html.main) Object.keys(plugins[pluginName].html.main).forEach((selector, i, array) => {
        byQSelect(selector).insertAdjacentHTML('beforeend', plugins[pluginName].html.main[selector]);
      });
      if (plugins[pluginName].css.main) pluginCss.innerHTML += plugins[pluginName].css.main;
      if (plugins[pluginName].js.main) eval(plugins[pluginName].js.main);
    } catch (err) {
      console.error(`Execution for ${pluginName} failed: `, err);
    }
  });
}
