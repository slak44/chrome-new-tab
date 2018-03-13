'use strict';

import 'global';
import {addThemeSettingsUI, initialUISetup as initialThemeUISetup, newTheme} from 'themes';
import {addSettingCard as addButtonSettingCard, newSettingCard as newButtonSettingCard,
  sorted as sortedButtons, insertButton} from 'buttons';
import {initPluginSettingsUI, appendPluginUI, initNewPlugins} from 'plugins';

/*
  Any time the user changes something, set this to false. When they save, reset it to false.
  If they try to leave without saving, warn them.
*/
window.changesMade = false;

$(window).on('beforeunload', () => {
  if (window.changesMade) return true;
});

storageLoad.then(() => {
  plugins.forEach(plugin => runViewContent(plugin, 'global'));
  initPluginSettingsUI();
  plugins.forEach((plugin, idx) => {
    runViewContent(plugin, 'settings');
    appendPluginUI(plugin, idx);
  });

  themes.forEach(addThemeSettingsUI);
  initialThemeUISetup();

  addButtonCards();
  updateButtonPreview();

  $('#backup-content').text(JSON.stringify({buttons, currentThemeIdx, themes, plugins}));
  $('#backup-modal').modal();
  $('#restore-modal').modal();
  $('#defaults-modal').modal();
});

function addButtonCards() {
  sortedButtons().forEach(button => addButtonSettingCard(button, button.realIndex));
}

const updateButtonPreview = (function () {
  const keepAmount = $('#buttons-live-preview > li').length;
  return function () {
    $('#buttons-container input').off('change keyup paste', updateButtonPreview);
    $('#buttons-container input').on('change keyup paste', updateButtonPreview);
    $('#buttons-live-preview > li').slice(keepAmount).remove(); // Remove everything below the "Live Preview" header
    sortedButtons().forEach(button => insertButton(button, $('#buttons-live-preview')[0]));
  };
})();

$('#version-string').text(`version ${chrome.runtime.getManifest().version}`);

$('#show-backup-content').click(() => $('#backup-content').removeClass('hidden'));

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
  storage.storeAll().then(location.reload);
}

$('#paste-restore').click(() => restore($('#restore-content').val()));

$('#upload-restore').click(() => {
  const file = $('#restore-file')[0].files[0];
  const reader = new FileReader();
  reader.addEventListener('loadend', event => restore(event.target.result));
  reader.readAsText(file);
});

$('#restore-defaults').click(() => {
  storage.clearAll();
  location.reload();
});

$('#add-button').click(event => {
  newButtonSettingCard('default');
  updateButtonPreview();
});
$('#add-divider').click(event => {
  newButtonSettingCard('divider');
  updateButtonPreview();
});
$('#add-subheader').click(event => {
  newButtonSettingCard('subheader');
  updateButtonPreview();
});

$('#add-theme').click(event => newTheme());
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
    newTheme(imported);
    window.changesMade = true;
  });
  reader.readAsText(file);
});

$('#floating-save-button').click(event => {
  buttons = buttons.filter(button => !button.deleted);
  themes = themes.filter(theme => !theme.deleted);
  plugins = plugins.filter(plugin => !plugin.deleted);

  const shouldReload = initNewPlugins();

  $('#buttons-container').empty();
  addButtonCards();
  Materialize.updateTextFields();
  updateButtonPreview();

  window.changesMade = false;
  Materialize.Toast.removeAll();
  storage.clearAllCached();
  storage.storeAll().then(() => {
    if (shouldReload) location.reload();
  });
});
