'use strict';
const semver = require('semver');

// Set to true using devtools to constantly read and update a plugin automatically without refreshing the page
window.persistentPluginReload = false;
// Time between reloads
window.reloadTimeout = 1000;

function storePlugins() {
  let pluginsInited = 0;
  plugins.filter(plugin => plugin.runInitCodeOnSave).forEach(plugin => {
    delete plugin.runInitCodeOnSave;
    try {
      if (plugin.init) eval(plugin.js.init);
      pluginsInited++;
    } catch (err) {
      Materialize.toast($(`<span>An error occurred during "${plugin.name}" initializtion</span>`), SHORT_DURATION_MS);
      console.error(err);
    }
  });
  storage.store('plugins', () => {
    if (window.persistentPluginReload) return;
    if (pluginsInited > 0) window.location.reload();
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
  $('ul.tabs').tabs('select_tab', 'settings-tab');
  addPlugin(file);
  if (window.persistentPluginReload) {
    if (reloadIntervalId) clearInterval(reloadIntervalId);
    reloadIntervalId = setInterval(() => {
      console.log(`Reload: ${file.name}`);
      addPlugin(file);
      storage.store('plugins');
    }, window.reloadTimeout);
  }
});

function appendPluginUI(plugin, idx) {
  const inputs = plugin.settings.reduce((accum, setting) => `
  ${accum}
  <div class="input-field">
    ${setting.desc ? `<i class="postfix material-icons grey-text" data-setting-name="${setting.name}">help</i>` : ''}
    <input name="${setting.name}" type="${setting.type}" value="${setting.value === undefined ? '' : setting.value}">
    <label for="${setting.name}" class="active">${setting.name}</label>
  </div>
  `, '');
  $('#settings-container').append(`
  <div class="plugin-data hidden" data-plugin-idx="${idx}">
    <h2>${plugin.name}</h2>
    <p>
      by ${plugin.author}
      <br/>
      version ${plugin.version}
    </p>
    ${inputs}
  </div>
  `);
  // FIXME cannot call this, update materialize to 1.0
  // Materialize.updateTextFields();
  const div = $(`.plugin-data[data-plugin-idx="${idx}"]`);
  plugin.settings.forEach((setting, settingIdx) => {
    if (plugin.desc) div.find(`i[data-setting-name="${setting.name}"]`).tooltip({
      delay: 50,
      position: 'top',
      tooltip: setting.desc
    });
    div.find(`input[name="${setting.name}"]`).on('keyup change paste', event => {
      plugins[idx].settings[settingIdx].value = event.target.value;
      window.changesMade = true;
    });
  });
  $('#plugins').append(`
    <li class="waves-effect">
      <a href="#!" data-plugin-idx="${idx}">
        ${plugin.name}
        <i class="material-icons right scale-transition scale-out waves-effect">close</i>
      </a>
    </li>
  `);
  const anchor = $(`#plugins [data-plugin-idx="${idx}"]`);
  anchor.click(event => {
    $('#plugins li.selection').removeClass('selection');
    anchor.parent().addClass('selection');
    $('.plugin-data:not(.hidden)').addClass('hidden');
    div.removeClass('hidden');
  });
  const removePluginBtn = $(`#plugins [data-plugin-idx="${idx}"] i`);
  anchor.parent().hover(
    event => removePluginBtn.addClass('scale-in'),
    event => removePluginBtn.removeClass('scale-in')
  );
  removePluginBtn.click(event => {
    event.stopPropagation();
    plugins[idx].deleted = true;
    window.changesMade = true;
    div.addClass('hidden');
    anchor.parent().addClass('hidden');
    undoToast(`Deleted plugin "${plugin.name}"`, `plugin-${idx}`, () => {
      plugins[idx].deleted = false;
      anchor.parent().removeClass('hidden');
    });
  });
}

module.exports = {
  appendPluginUI,
  storePlugins
};
