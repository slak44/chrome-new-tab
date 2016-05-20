'use strict';

require('./src/global.js');
const async = require('async');
const buttonsUtil = require('./src/secondary/buttons.js');
const pluginsUtil = require('./src/secondary/plugins.js');

let activeSchemeIndex = 0;
loadSchemes(() => {
  activateScheme(colorSchemes[0]);
  async.parallel([loadButtons, loadPlugins, loadSchemesAndUI], function (err) {
    if (err) throw err;
    runPlugins();
  });
});

byId('floating-save-button').addEventListener('click', function (evt) {
  if (hasClass(byId('settings-tab'), 'focused')) {
    pluginsUtil.saveFocusedPluginSettings();
  } else if (hasClass(byId('buttons-tab'), 'focused')) {
    let id = byId('button-text').getAttribute('data-button-id');
    if (id === '') return;
    buttons[id] = {
      text: byId('button-text').value,
      href: byId('button-link').value,
      imagePath: byId('button-image').value,
      position: byId('button-position').value,
      hotkey: byId('button-hotkey').value.toUpperCase(),
      openInNew: Boolean(byId('button-replace-tab').checked)
    };
    storage.store('buttons');
  } else if (hasClass(byId('color-scheme-tab'), 'focused')) {
    // Switch the active one at the top
    let originalScheme = colorSchemes[0];
    colorSchemes[0] = colorSchemes[activeSchemeIndex];
    colorSchemes[activeSchemeIndex] = originalScheme;
    storage.store('colorSchemes');
  }
});

function showTab(id) {
  return function (e) {
    e.preventDefault();
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
byId('show-data').addEventListener('click', function (event) {
  createDataJson();
});

byId('copy-data').addEventListener('click', function (event) {
  createDataJson();
  byId('copy-data-display').select();
  document.execCommand('copy');
  byId('copy-data-display').value = '';
  byId('copy-data').focus();
});

byId('restore-data').addEventListener('click', function (event) {
  function restore(what, dataObject) {
    return function (callback) {
      window[what] = dataObject[`${what}Data`];
      storage.store(what, callback);
    };
  }
  if (byId('insert-data').value !== '') {
    let data = JSON.parse(byId('insert-data').value);
    let toRestore = [restore('plugins', data), restore('buttons', data)];
    if (!data.pluginsData) {
      if (!confirm('Plugin data is missing. Continue?')) toRestore.unshift();
    }
    if (!data.buttonsData) {
      if (!confirm('Button data is missing. Continue?')) toRestore.pop();
    }
    async.parallel(toRestore, function (err, results) {
      if (err) {
        alert(`Data restore failed: ${err}`);
        throw err;
      }
      alert('Data restore successful!');
      window.location.reload();
    });
  }
});

byId('add-plugin').addEventListener('click', function (e) {
  pluginsUtil.addFromFile();
});
byId('remove-plugin').addEventListener('click', function (e) {
  pluginsUtil.promptRemoval();
});

byId('add-scheme').addEventListener('click', function (e) {
  alert('This feature is not yet implemented.'); // TODO
});
byId('remove-scheme').addEventListener('click', function (e) {
  if (!confirm('Remove this scheme?')) return;
  colorSchemes.splice(activeSchemeIndex, 1);
  let schemeElement = byQSelect('#color-scheme-list > a.active');
  schemeElement.parentNode.removeChild(schemeElement);
  byId('color-scheme-list').children[0].classList.add('active');
  storage.store('colorSchemes');
});

byId('add-buttons').addEventListener('click', function (event) {
  event.preventDefault();
  buttonsUtil.createNewButton();
});
byId('remove-buttons').addEventListener('click', function (event) {
  event.preventDefault();
  buttonsUtil.removeButton();
});

function loadButtons(callback) {
  storage.load('buttons',
  function (error) {
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
    pluginsUtil.insertPluginHTML(plugins[pluginName], !byClass('plugin-container').length); // Only the first addition gets focus
    try {
      if (plugins[pluginName].html.secondary) Object.keys(plugins[pluginName].html.secondary).forEach(function (selector, i, array) {
        byQSelect(selector).insertAdjacentHTML('beforeend', array[selector]);
      });
      if (plugins[pluginName].css.secondary) pluginCss.innerHTML += plugins[pluginName].css.secondary;
      if (plugins[pluginName].js.secondary) eval(plugins[pluginName].js.secondary);
    } catch (err) {
      console.error(`Execution for ${pluginName} failed: `, err);
    }
  });
}

function loadSchemesAndUI(callback) {
  function eachScheme(scheme, i, array) {
    let htmlContent = `<a href="#!" class="collection-item color">${scheme.name}<div class="row top-margin">`;
    function addColor(colorName, index, array) {
      htmlContent += `<div style="background-color: ${scheme[colorName]};" class="col s1 color-sample"></div>`;
    }
    // Add dark/light
    htmlContent += `<div style="background-color: ${scheme.isDark ? 'black' : 'white'};" class="col s1 color-sample"></div>`;
    // Add dark colors from darkest
    Object.keys(scheme).filter(e => e.startsWith('darken')).sort((a, b) => (b > a ? 1 : -1)).forEach(addColor);
    // Add main color
    htmlContent += `<div style="background-color: ${scheme.main};" class="col s1 color-sample"></div>`;
    // Add light colors from least light
    Object.keys(scheme).filter(e => e.startsWith('lighten')).sort().forEach(addColor);
    // Split accent from main colors
    htmlContent += '<br style="line-height: 75px;">';
    // Add accent
    Object.keys(scheme).filter(e => e.startsWith('accent')).sort().forEach(addColor);
    
    htmlContent += '</div></a>';
    
    byId('color-scheme-list').insertAdjacentHTML('beforeend', htmlContent);
    Array.from(byId('color-scheme-list').children).forEach(function (schemeElement, i, arr) {
      if (i === 0) schemeElement.classList.add('active');
      schemeElement.addEventListener('click', function (evt) {
        let actives = byQSelect('#color-scheme-list > a.active');
        if (actives) actives.classList.remove('active');
        schemeElement.classList.add('active');
        activeSchemeIndex = i;
      });
    });
  }
  setTimeout(() => {
    colorSchemes.forEach(eachScheme);
    callback();
  }, 0);
}
