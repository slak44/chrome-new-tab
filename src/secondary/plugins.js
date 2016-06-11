'use strict';

function addFromFile() {
  byId('file-input').addEventListener('change', event => addPlugin(event), false);
  byId('file-input').click();
}

function promptRemoval() {
  delete plugins[prompt('Plugin to remove:')];
  storage.store('plugins');
  window.location.reload();
}

function saveFocusedPluginSettings() {
  const currentPluginContainer = byQSelect('.plugin-container.focused');
  // Plugin container ids have the form `${pluginName}-container`
  const currentPluginName = currentPluginContainer.id.slice(0, -('-container'.length));
  // Ignore the title and the description
  const childrenToIgnore = 2;
  Array.from(currentPluginContainer.children).forEach((settingDiv, i, children) => {
    if (i < childrenToIgnore) return;
    plugins[currentPluginName].settings[i - childrenToIgnore].value = settingDiv.children[0].value;
  });
  storage.store('plugins');
}

function insertPluginSettingsHTML(pluginObject, isFocused) {
  // Add to dropdown list
  byId('plugins-list').insertAdjacentHTML('beforeend',
    `<li id="${pluginObject.name}">
      <a href="#!">${pluginObject.name}</a>
    </li>`
  );
  // Add container for settings
  byId('settings-tab').insertAdjacentHTML('beforeend',
    `<div id="${pluginObject.name}-container" class="plugin-container ${isFocused ? 'focused' : 'unfocused'}"></div>`
  );
  const container = byId(`${pluginObject.name}-container`);
  // Add metadata
  container.insertAdjacentHTML('beforeend',
    `<h5 class="plugin-title">${pluginObject.name}</h5>
    <p class="plugin-desc">
      ${pluginObject.desc}
      <br>
      ${pluginObject.version} by ${pluginObject.author}
    </p>`
  );
  // If there are settings, add their markup, otherwise add a message saying there are no plugins
  if (pluginObject.settings && pluginObject.settings.length > 0) {
    pluginObject.settings.forEach((setting, i, settings) => {
      if (!setting.isVisible) return;
      container.insertAdjacentHTML('beforeend',
        `<div class="input-field">
          <input id="${setting.name}" placeholder="${setting.desc}" type="${setting.type}" value="${setting.value}" class="">
          <label for="${setting.name}" class="active">${setting.name}</label>
        </div>`
      );
    });
  } else {
    container.insertAdjacentHTML('beforeend', '<p>There are no settings for this plugin</p>');
  }
  // If the button in the dropdown list is pressed, hide the current plugin's container, and show this plugin's container
  byId(pluginObject.name).addEventListener('click', event => {
    const focusedContainer = byQSelect('.plugin-container.focused');
    toggleDiv(focusedContainer);
    focusedContainer.style.display = 'none';
    toggleDiv(container);
    container.style.display = 'block';
  });
}

// Set to true using devtools to constantly read and update a plugin automatically without refreshing the page
window.persistentPluginReload = false;
// Time between reloads
window.reloadTimeout = 1000;

function addPlugin(event) {
  const semver = require('semver');
  const file = event.target.files[0];
  function readCallback(err, plugin) {
    if (err) {
      alert(err.message);
      throw err;
    }
    const oldPlugin = plugins[plugin.name];
    if (!semver.valid(plugin.version)) {
      alert('Plugin version is invalid.');
      return;
    }
    plugins[plugin.name] = plugin;
    // Preserve settings if major versions match
    if (semver.major(plugin.version) === semver.major(oldPlugin.version)) {
      plugins[plugin.name].settings = oldPlugin.settings;
    }
    if (plugin.init) eval(plugin.js.init);
    storage.store('plugins', storeCallback);
  }
  const storeCallback = (function () {
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
  const reader = new FileReader();
  reader.addEventListener('loadend', event => {
    callback(null, JSON.parse(event.target.result));
  });
  reader.readAsText(blob);
}

module.exports = {
  addFromFile,
  promptRemoval,
  insertPluginSettingsHTML,
  saveFocusedPluginSettings
};
