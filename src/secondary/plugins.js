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
  let currentPlugin = byQSelect('.plugin-container.focused');
  // Plugin container ids have the form `${pluginName}-container`
  const charsToRemove = '-container'.length;
  let currentPluginName = currentPlugin.id.slice(0, -charsToRemove);
  const childrenToIgnore = 2; // Ignore the title and the description
  Array.from(currentPlugin.children).forEach(function (settingDiv, i, children) {
    if (i < childrenToIgnore) return;
    plugins[currentPluginName].settings[i - childrenToIgnore].value = settingDiv.children[0].value;
  });
  storage.store('plugins');
}

function insertPluginHTML(pluginObject, isFocused) {
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
  let container = byId(`${pluginObject.name}-container`);
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
    pluginObject.settings.forEach(function (setting, i, settings) {
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
  byId(pluginObject.name).addEventListener('click', function (event) {
    let focusedContainer = byQSelect('.plugin-container.focused');
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
    // TODO: check if settings have changed between versions(or use the major version?) and wipe them if so, disregarding this option
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

module.exports = {
  addFromFile,
  promptRemoval,
  insertPluginHTML,
  saveFocusedPluginSettings
};
