'use strict';

require('./src/global.js');
const async = require('async');

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
    let currentPlugin = byQSelect('.plugin-container.focused');
    // Plugin container ids have the form `${pluginName}-container`
    const charsToRemove = '-container'.length;
    let cpId = currentPlugin.id.slice(0, -charsToRemove);
    const childrenToIgnore = 2; // Ignore the title and the description
    Array.from(currentPlugin.children).forEach(function (settingDiv, i, children) {
      if (i < childrenToIgnore) return;
      plugins[cpId].settings[i - childrenToIgnore].value = settingDiv.children[0].value;
    });
    storage.store('plugins');
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
    toggleDiv(byQSelect('.data-tab.focused'), true);
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
  byId('file-input').addEventListener('change', (e) => addPlugin(e), false);
  byId('file-input').click();
});
byId('remove-plugin').addEventListener('click', function (e) {
  delete plugins[prompt('Plugin to remove:')];
  storage.store('plugins');
  window.location.reload();
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

byId('add-buttons').addEventListener('click', function (e) {
  e.preventDefault();
  let id = prompt('Input a unique identifier for the button:');
  if (id === null) return;
  if (buttons[id] !== undefined && buttons[id] !== null) {
    alert('Identifier already exists.');
    return;
  }
  buttons[id] = {
    text: '',
    href: '',
    imagePath: '',
    hotkey: '',
    order: '',
    checked: false
  };
  setCurrentButton(buttons[id], id);
  byId('buttons-list').insertAdjacentHTML('beforeend',
  `<li id="${id}">
    <a href="#!">${id}</a>
  </li>`
  );
});
byId('remove-buttons').addEventListener('click', function (e) {
  e.preventDefault();
  if (!confirm('Are you sure you want to delete this button?')) return;
  let id = byId('button-text').getAttribute('data-button-id');
  delete buttons[id];
  byId(id).parentNode.removeChild(byId(id));
  setDefaultButton();
  storage.store('buttons');
});

function loadButtons(cb) {
  storage.load('buttons',
  function (error) {
    if (error || Object.keys(buttons).length === 0) {
      buttons = {};
      cb(error);
      return;
    }
    setDefaultButton();
    let dropdown = byId('buttons-list');
    for (let id in buttons) {
      dropdown.insertAdjacentHTML('beforeend',
        `<li id="${id}">
          <a href="#!">${id}</a>
        </li>`
      );
      byId(id).addEventListener('click', event => setCurrentButton(buttons[id], id));
    }
    cb();
  });
}

function setCurrentButton(buttonData, id) {
  byId('button-name').innerText = id;
  byId('button-text').setAttribute('data-button-id', id);
  byId('button-text').value = buttonData.text;
  byId('button-link').value = buttonData.href;
  byId('button-image').value = buttonData.imagePath;
  byId('button-position').value = buttonData.position;
  byId('button-hotkey').value = buttonData.hotkey;
  byId('button-replace-tab').checked = buttonData.openInNew;
  Materialize.updateTextFields();
}

function setDefaultButton() {
  let firstButtonId = Object.keys(buttons)[0];
  if (firstButtonId !== undefined) setCurrentButton(buttons[firstButtonId], firstButtonId);
}

function runPlugins() {
  Object.keys(plugins).forEach(pluginName => {
    addPluginData(plugins[pluginName], !byClass('plugin-container').length); // Only the first addition gets focus
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

function addPluginData(plugin, focus) {
  byId('plugins-list').insertAdjacentHTML('beforeend',
    `<li id="${plugin.name}">
      <a href="#!">${plugin.name}</a>
    </li>`
  );
  byId('settings-tab').insertAdjacentHTML('beforeend',
    `<div id="${plugin.name}-container" class="plugin-container ${(focus ? 'focused' : 'unfocused')}"></div>`
  );
  let container = byId(plugin.name + '-container');
  container.insertAdjacentHTML('beforeend',
    `<h5 class="plugin-title">${plugin.name}</h5>
    <p class="plugin-desc">
      ${plugin.desc}
      <br>
      ${plugin.version} by ${plugin.author}
    </p>`
  );
  if (plugin.settings) {
    plugin.settings.forEach(function (setting, i, settings) {
      if (!setting.isVisible) return;
      container.insertAdjacentHTML('beforeend',
        `<div class="input-field">
          <input id="${setting.name}" placeholder="${setting.desc}" type="${setting.type}" value="${setting.value}" class="">
          <label for="${setting.name}" class="active">${setting.name}</label>
        </div>`
      );
    });
  } else {
    container.insertAdjacentHTML('beforeend', '<p>There isn\'t anything here</p>');
  }
  byId(plugin.name).addEventListener('click', function (evt) {
    let container = byQSelect('.plugin-container.focused');
    toggleDiv(container, true);
    container.style.display = 'none';
    byId(plugin.name + '-container').style.display = 'block';
    toggleDiv(plugin.name + '-container');
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

// Set to true using devtools to constantly read and update a plugin automatically without refreshing the page
window.persistentPluginReload = false;
window.reloadTimeout = 1000;

function addPlugin(event) {
  let file = event.target.files[0];
  function readCallback(err, plugin) {
    if (err) {
      alert(err.message);
      throw err;
    }
    let oldPlugin = plugins[plugin.name];
    if (plugin.init) eval(plugin.js.init);
    // Use existing settings if possible
    if (oldPlugin && plugin.preserveSettings) plugin.settings = oldPlugin.settings;
    // TODO: check if settings have changed between versions and wipe them if so, disregarding this option
    plugins[plugin.name] = plugin;
    storage.store('plugins', storeCallback);
  }
  let storeCallback = (function () {
    if (!window.persistentPluginReload) {
      window.location.reload();
    } else {
      console.log(`Reload: ${this.file.name}`);
      setTimeout(() => readPlugin(this.file, readCallback), window.reloadTimeout);
    }
  }).bind({file});
  
  readPlugin(file, readCallback);
}

function readPlugin(blob, callback) {
  let reader = new FileReader();
  reader.addEventListener('loadend', function (event) {
    let plugin = JSON.parse(event.target.result);
    callback(null, plugin);
  });
  reader.readAsText(blob);
}
