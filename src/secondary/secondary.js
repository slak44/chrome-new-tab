'use strict';

require('global');
const async = require('async');
const buttonsUtil = require('buttons');
const pluginsUtil = require('./plugins');
const themesUtil = require('themes');

/*
  Any time the user changes something, set this to false. When they save, reset it to false.
  If they try to leave without saving, warn them.
*/
window.changesMade = false;

$(window).on('beforeunload', () => {
  if (window.changesMade) return true;
});

byId('version-string').innerText = `version ${chrome.runtime.getManifest().version}`;

// loadSchemes(() => {
//   activateScheme(colorSchemes[0]);
//   colorSchemes.forEach(scheme => schemesUtil.insertPreviewHTML(scheme));
//   schemesUtil.initSchemesEventListeners();
// });
$(document).ready(() => {
  themes.forEach(themesUtil.addThemeSettingsUI);
  themesUtil.setUpInitialUI();
});

async.parallel([loadButtons, loadPlugins], err => {
  if (err) throw err;
  $('#backup-modal').modal();
  $('#backup-content').text(JSON.stringify({buttons, currentThemeIdx, themes, plugins}));
  $('#restore-modal').modal();
  runPlugins();
});

$('#copy-backup').click(() => {
  $('#backup-content').focus();
  $('#backup-content').select();
  document.execCommand('copy');
  Materialize.toast($('<span>Copied</span>'), SHORT_DURATION_MS);
});

$('#download-backup').click(() => {
  const anchor = document.createElement('a');
  anchor.download = 'newtab-settings.bck';
  anchor.href = `data:text/plain;charset=UTF-8,${$('#backup-content').text()}`;
  anchor.click();
});

function restore(fromText) {
  try {
    ({buttons, currentThemeIdx, themes, plugins} = JSON.parse(fromText));
  } catch (err) {
    Materialize.toast($('<span>Failed to restore data (parse error, check data)</span>'), SHORT_DURATION_MS);
    console.error(err);
    return;
  }
  async.parallel([
    cb => storage.store('buttons', cb),
    cb => storage.store('currentThemeIdx', cb),
    cb => storage.store('themes', cb),
    cb => storage.store('plugins', cb),
  ], err => {
    if (err) {
      Materialize.toast($('<span>Failed to restore data (storage error)</span>'), SHORT_DURATION_MS);
      console.error(err);
      return;
    }
    window.location.reload();
  });
}

$('#paste-restore').click(() => restore($('#restore-content').val()));

$('#upload-restore').click(() => {
  const file = $('#restore-file')[0].files[0];
  const reader = new FileReader();
  reader.addEventListener('loadend', event => restore(event.target.result));
  reader.readAsText(file);
});

$('#add-button').click(event => buttonsUtil.newSettingCard('default'));
$('#add-divider').click(event => buttonsUtil.newSettingCard('divider'));
$('#add-subheader').click(event => buttonsUtil.newSettingCard('subheader'));

$('#add-theme').click(event => themesUtil.newTheme());
$('#import-theme').click(() => $('#theme-file-add').click());

$('#theme-file-add').change(event => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('loadend', event => {
    let imported;
    try {
      imported = JSON.parse(event.target.result);
    } catch (err) {
      Materialize.toast($('<span>Failed to import theme (parse error, check data)</span>'), SHORT_DURATION_MS);
      console.error(err);
      return;
    }
    themesUtil.newTheme(imported);
    window.changesMade = true;
  });
  reader.readAsText(file);
});

function updateButtonPreview() {
  $('#buttons-live-preview > li').slice(1).remove(); // Keep the "Live Preview" header
  buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons-live-preview')[0]));
}

function loadButtons(callback) {
  storage.load('buttons', error => {
    if (error) {
      // buttons = {};
      callback(error);
      return;
    }
    // if (Object.keys(buttons).length === 0) {
    //   callback(null);
    //   return;
    // }
    buttons.forEach(buttonsUtil.addSettingCard);
    updateButtonPreview();
    $('#buttons-container input').on('change keyup paste', event => updateButtonPreview());
    // buttonsUtil.activateDefaultButton();
    // buttonsUtil.initDropdown();
    callback(null);
  });
}

function runPlugins() {
  plugins.forEach((plugin, idx) => {
    pluginsUtil.appendPluginUI(plugin, idx);
    runViewContent(plugin, 'secondary');
    // pluginsUtil.insertPluginSettingsHTML(plugin, !byClass('plugin-container').length); // Only the first addition gets focus
    // try {
    //   if (plugin.html.secondary) Object.keys(plugin.html.secondary).forEach((selector, i, array) => {
    //     byQSelect(selector).insertAdjacentHTML('beforeend', array[selector]);
    //   });
    //   if (plugin.css.secondary) pluginCss.innerHTML += plugin.css.secondary;
    //   if (plugin.js.secondary) eval(plugin.js.secondary);
    // } catch (err) {
    //   console.error(`Execution for ${plugin.name} failed: `, err);
    // }
  });
}

byId('floating-save-button').addEventListener('click', event => {
  // Store plugins
  pluginsUtil.storePlugins();
  // Store buttons
  buttons = buttons.filter(button => !button.deleted);
  storage.store('buttons');
  // FIXME actually look which have been deleted rather than just readding all of them
  $('#buttons-container').empty();
  buttons.forEach(buttonsUtil.addSettingCard);
  Materialize.updateTextFields();
  // Store themes
  storage.store('themes');
  storage.store('currentThemeIdx');
  window.changesMade = false;
  // if (hasClass(byId('settings-tab'), 'focused')) {
  //   pluginsUtil.saveFocusedPluginSettings();
  // } else if (hasClass(byId('buttons-tab'), 'focused')) {
  //   const id = byId('button-text').getAttribute('data-button-id');
  //   if (id === '') return;
  //   buttonsUtil.saveFocusedButton(id);
  // } else if (hasClass(byId('color-scheme-tab'), 'focused')) {
  //   schemesUtil.saveSelected();
  // }
});

// function showTab(id) {
//   return function (event) {
//     event.preventDefault();
//     toggleDiv(byQSelect('.data-tab.focused'));
//     toggleDiv(id);
//   };
// }
// byId('plugin-settings').addEventListener('click', showTab('settings-tab'));
// byId('button-list').addEventListener('click', showTab('buttons-tab'));
// byId('backup-and-restore').addEventListener('click', showTab('json-tab'));
// byId('color-scheme').addEventListener('click', showTab('color-scheme-tab'));
//
// function createDataJson() {
//   byId('copy-data-display').value = JSON.stringify({
//     pluginsData: plugins,
//     buttonsData: buttons
//   });
// }
// byId('show-data').addEventListener('click', event => {
//   createDataJson();
// });
//
// byId('copy-data').addEventListener('click', event => {
//   createDataJson();
//   byId('copy-data-display').select();
//   document.execCommand('copy');
//   byId('copy-data-display').value = '';
//   byId('copy-data').focus();
// });
//
// byId('restore-data').addEventListener('click', event => {
//   function restore(what, dataObject) {
//     return function (callback) {
//       window[what] = dataObject[`${what}Data`];
//       storage.store(what, callback);
//     };
//   }
//   if (byId('insert-data').value !== '') {
//     const data = JSON.parse(byId('insert-data').value);
//     const toRestore = [restore('plugins', data), restore('buttons', data)];
//     if (!data.pluginsData) {
//       if (!confirm('Plugin data is missing. Continue?')) toRestore.unshift();
//     }
//     if (!data.buttonsData) {
//       if (!confirm('Button data is missing. Continue?')) toRestore.pop();
//     }
//     async.parallel(toRestore, (err, results) => {
//       if (err) {
//         alert(`Data restore failed: ${err}`);
//         throw err;
//       }
//       alert('Data restore successful!');
//       window.location.reload();
//     });
//   }
// });
//
// byId('add-plugin').addEventListener('click', event => {
//   pluginsUtil.addFromFile();
// });
// byId('remove-plugin').addEventListener('click', event => {
//   pluginsUtil.promptRemoval();
// });
//
// byId('add-scheme').addEventListener('click', event => {
//   schemesUtil.addFromFile();
// });
// byId('remove-scheme').addEventListener('click', event => {
//   schemesUtil.removeSelected();
// });
//
// byId('add-buttons').addEventListener('click', event => {
//   event.preventDefault();
//   buttonsUtil.createNewButton();
// });
// byId('remove-buttons').addEventListener('click', event => {
//   event.preventDefault();
//   buttonsUtil.removeButton();
// });
