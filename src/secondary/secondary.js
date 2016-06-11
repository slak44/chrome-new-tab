'use strict';

require('./src/global.js');
const async = require('async');
const buttonsUtil = require('./src/secondary/buttons.js');
const pluginsUtil = require('./src/secondary/plugins.js');
const schemesUtil = require('./src/secondary/schemes.js');

byId('version-string').innerText = `version ${chrome.runtime.getManifest().version}`;

loadSchemes(() => {
  activateScheme(colorSchemes[0]);
  colorSchemes.forEach(scheme => schemesUtil.insertPreviewHTML(scheme));
  schemesUtil.initSchemesEventListeners();
});
async.parallel([loadButtons, loadPlugins], err => {
  if (err) throw err;
  runPlugins();
});

function loadButtons(callback) {
  storage.load('buttons',
  error => {
    if (error || Object.keys(buttons).length === 0) {
      buttons = {};
      callback(error);
      return;
    }
    buttonsUtil.activateDefaultButton();
    buttonsUtil.initDropdown();
    callback();
  });
}

function runPlugins() {
  Object.keys(plugins).forEach(pluginName => {
    pluginsUtil.insertPluginSettingsHTML(plugins[pluginName], !byClass('plugin-container').length); // Only the first addition gets focus
    try {
      if (plugins[pluginName].html.secondary) Object.keys(plugins[pluginName].html.secondary).forEach((selector, i, array) => {
        byQSelect(selector).insertAdjacentHTML('beforeend', array[selector]);
      });
      if (plugins[pluginName].css.secondary) pluginCss.innerHTML += plugins[pluginName].css.secondary;
      if (plugins[pluginName].js.secondary) eval(plugins[pluginName].js.secondary);
    } catch (err) {
      console.error(`Execution for ${pluginName} failed: `, err);
    }
  });
}

byId('floating-save-button').addEventListener('click', event => {
  if (hasClass(byId('settings-tab'), 'focused')) {
    pluginsUtil.saveFocusedPluginSettings();
  } else if (hasClass(byId('buttons-tab'), 'focused')) {
    const id = byId('button-text').getAttribute('data-button-id');
    if (id === '') return;
    buttonsUtil.saveFocusedButton(id);
  } else if (hasClass(byId('color-scheme-tab'), 'focused')) {
    schemesUtil.saveSelected();
  }
});

function showTab(id) {
  return function (event) {
    event.preventDefault();
    toggleDiv(byQSelect('.data-tab.focused'));
    toggleDiv(id);
  };
}
byId('plugin-settings').addEventListener('click', showTab('settings-tab'));
byId('button-list').addEventListener('click', showTab('buttons-tab'));
byId('backup-and-restore').addEventListener('click', showTab('json-tab'));
byId('color-scheme').addEventListener('click', showTab('color-scheme-tab'));

function createDataJson() {
  byId('copy-data-display').value = JSON.stringify({
    pluginsData: plugins,
    buttonsData: buttons
  });
}
byId('show-data').addEventListener('click', event => {
  createDataJson();
});

byId('copy-data').addEventListener('click', event => {
  createDataJson();
  byId('copy-data-display').select();
  document.execCommand('copy');
  byId('copy-data-display').value = '';
  byId('copy-data').focus();
});

byId('restore-data').addEventListener('click', event => {
  function restore(what, dataObject) {
    return function (callback) {
      window[what] = dataObject[`${what}Data`];
      storage.store(what, callback);
    };
  }
  if (byId('insert-data').value !== '') {
    const data = JSON.parse(byId('insert-data').value);
    const toRestore = [restore('plugins', data), restore('buttons', data)];
    if (!data.pluginsData) {
      if (!confirm('Plugin data is missing. Continue?')) toRestore.unshift();
    }
    if (!data.buttonsData) {
      if (!confirm('Button data is missing. Continue?')) toRestore.pop();
    }
    async.parallel(toRestore, (err, results) => {
      if (err) {
        alert(`Data restore failed: ${err}`);
        throw err;
      }
      alert('Data restore successful!');
      window.location.reload();
    });
  }
});

byId('add-plugin').addEventListener('click', event => {
  pluginsUtil.addFromFile();
});
byId('remove-plugin').addEventListener('click', event => {
  pluginsUtil.promptRemoval();
});

byId('add-scheme').addEventListener('click', event => {
  alert('This feature is not yet implemented.'); // TODO
});
byId('remove-scheme').addEventListener('click', event => {
  schemesUtil.removeSelected();
});

byId('add-buttons').addEventListener('click', event => {
  event.preventDefault();
  buttonsUtil.createNewButton();
});
byId('remove-buttons').addEventListener('click', event => {
  event.preventDefault();
  buttonsUtil.removeButton();
});
