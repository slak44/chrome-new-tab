'use strict';
const semver = require('semver');

// Set to true using devtools to constantly read and update a plugin automatically without refreshing the page
window.persistentPluginReload = false;
// Time between reloads
window.reloadTimeout = 1000;
// Times reloaded
let reloadCount = 0;

function storePlugins() {
  plugins.filter(plugin => plugin.runInitCodeOnSave).forEach(plugin => {
    delete plugin.runInitCodeOnSave;
    try {
      if (plugin.init) eval(plugin.js.init);
    } catch (err) {
      Materialize.toast($(`<span>An error occurred during "${plugin.name}" initializtion</span>`), SHORT_DURATION_MS);
      console.error(err);
    }
  });
  storage.store('plugins', () => {
    if (window.persistentPluginReload) return;
    window.location.reload();
  });
}

// Preserve values of settings whose name and type did not change
function preserveSettings(plugin, oldPlugin) {
  oldPlugin.settings
    .filter(oldSetting => plugin.settings.some(newSetting =>
      newSetting.name === oldSetting.name && newSetting.type === oldSetting.type))
    .forEach(preservedOldSetting => {
      const idx = plugin.settings.findIndex(setting => setting.name === preservedOldSetting.name);
      plugin.settings[idx].value = preservedOldSetting.value;
    });
}

function addPlugin(file) {
  const reader = new FileReader();
  reader.addEventListener('loadend', event => {
    let plugin;
    try {
      plugin = JSON.parse(event.target.result);
    } catch (err) {
      Materialize.toast($('<span>Cannot parse plugin</span>'), SHORT_DURATION_MS);
      console.error(err);
      return;
    }
    if (!semver.valid(plugin.version)) {
      Materialize.toast($('<span>Invalid plugin version</span>'), SHORT_DURATION_MS);
      return;
    }
    const oldPluginIdx = plugins.findIndex(e => e.name === plugin.name && e.author === plugin.author);
    plugin.runInitCodeOnSave = true;
    if (oldPluginIdx > -1) {
      const oldPlugin = plugins[oldPluginIdx];
      if (semver.lt(plugin.version, oldPlugin.version)) {
        Materialize.toast($(`<span>Warning: downgrading ${plugin.name}</span>`), SHORT_DURATION_MS);
      }
      plugins[oldPluginIdx] = plugin;
      preserveSettings(plugin, oldPlugin);
    } else {
      plugins.push(plugin);
      appendPluginUI(plugin, plugins.length - 1);
    }
    window.changesMade = true;
  });
  reader.readAsText(file);
}

$('#add-plugin').click(event => $('#plugin-file-add').click());

let reloadIntervalId;
$('#plugin-file-add').change(event => {
  const file = event.target.files[0];
  addPlugin(file);
  if (window.persistentPluginReload) {
    if (reloadIntervalId) clearInterval(reloadIntervalId);
    reloadIntervalId = setInterval(() => {
      console.log(`Reload: ${file.name}`);
      addPlugin(file);
      storage.store('plugins');
      reloadCount++;
    }, window.reloadTimeout);
  }
});

function appendPluginUI(plugin, idx) {
  $('#plugins').append(`
    <li class="waves-effect">
      <a href="#!" data-plugin-idx="${idx}">${plugin.name}</a>
    </li>
  `);
  const anchor = $(`#plugins [data-plugin-idx="${idx}"]`);
  // TODO add click listener
  // TODO add settings ui
}

// function addFromFile() {
//   const semver = require('semver');
//   function readCallback(err, file, pluginText) {
//     if (err) {
//       alert(err.message);
//       throw err;
//     }
//     const plugin = JSON.parse(pluginText);
//     const oldPlugin = plugins[plugin.name];
//     if (!semver.valid(plugin.version)) {
//       alert('Plugin version is invalid.');
//       return;
//     }
//     plugins[plugin.name] = plugin;
//     // Preserve settings if major versions match
//     if (oldPlugin && semver.major(plugin.version) === semver.major(oldPlugin.version)) {
//       plugins[plugin.name].settings = oldPlugin.settings;
//     }
//     if (plugin.init) eval(plugin.js.init);
//     storage.store('plugins', () => {
//       if (!window.persistentPluginReload) {
//         window.location.reload();
//       } else {
//         console.log(`Reload: ${file.name}`);
//         setTimeout(() => readFile(file, readCallback), window.reloadTimeout);
//       }
//     });
//   }
//   getFile(readCallback);
// }
//
// function getFocusedPluginName() {
//   const currentPluginContainer = byQSelect('.plugin-container.focused');
//   // Plugin container ids have the form `${pluginName}-container`
//   return currentPluginContainer.id.slice(0, -('-container'.length));
// }
//
// function promptRemoval() {
//   const focusedPlugin = getFocusedPluginName();
//   if (!confirm(`Delete the plugin '${focusedPlugin}'?`)) return;
//   delete plugins[focusedPlugin];
//   storage.store('plugins');
//   window.location.reload();
// }
//
// function saveFocusedPluginSettings() {
//   const currentPluginName = getFocusedPluginName();
//   // Ignore the title and the description
//   const childrenToIgnore = 2;
//   Array.from(byQSelect('.plugin-container.focused').children).forEach((settingDiv, i, children) => {
//     if (i < childrenToIgnore) return;
//     plugins[currentPluginName].settings[i - childrenToIgnore].value = settingDiv.children[0].value;
//   });
//   storage.store('plugins');
// }
//
// function insertPluginSettingsHTML(pluginObject, isFocused) {
//   // Add to dropdown list
//   byId('plugins-list').insertAdjacentHTML('beforeend',
//     `<li id="${pluginObject.name}">
//       <a href="#!">${pluginObject.name}</a>
//     </li>`
//   );
//   // Add container for settings
//   byId('settings-tab').insertAdjacentHTML('beforeend',
//     `<div id="${pluginObject.name}-container" class="plugin-container ${isFocused ? 'focused' : 'unfocused'}"></div>`
//   );
//   const container = byId(`${pluginObject.name}-container`);
//   // Add metadata
//   container.insertAdjacentHTML('beforeend',
//     `<h5 class="plugin-title">${pluginObject.name}</h5>
//     <p class="plugin-desc">
//       ${pluginObject.desc}
//       <br>
//       ${pluginObject.version} by ${pluginObject.author}
//     </p>`
//   );
//   // If there are settings, add their markup, otherwise add a message saying there are no plugins
//   if (pluginObject.settings && pluginObject.settings.length > 0) {
//     pluginObject.settings.forEach((setting, i, settings) => {
//       if (!setting.isVisible) return;
//       container.insertAdjacentHTML('beforeend',
//         `<div class="input-field">
//           <input id="${setting.name}" placeholder="${setting.desc}" type="${setting.type}" value="${setting.value}" class="">
//           <label for="${setting.name}" class="active">${setting.name}</label>
//         </div>`
//       );
//     });
//   } else {
//     container.insertAdjacentHTML('beforeend', '<p>There are no settings for this plugin</p>');
//   }
//   // If the button in the dropdown list is pressed, hide the current plugin's container, and show this plugin's container
//   byId(pluginObject.name).addEventListener('click', event => {
//     const focusedContainer = byQSelect('.plugin-container.focused');
//     toggleDiv(focusedContainer);
//     focusedContainer.style.display = 'none';
//     toggleDiv(container);
//     container.style.display = 'block';
//   });
// }

module.exports = {
  appendPluginUI,
  storePlugins
  // addFromFile,
  // promptRemoval,
  // insertPluginSettingsHTML,
  // saveFocusedPluginSettings
};
