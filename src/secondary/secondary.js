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

$(document).ready(() => {
  themes.forEach(themesUtil.addThemeSettingsUI);
  themesUtil.setUpInitialUI();
});

async.parallel([loadButtons, loadPlugins], err => {
  if (err) throw err;
  $('#backup-modal').modal();
  $('#backup-content').text(JSON.stringify({buttons, currentThemeIdx, themes, plugins}));
  $('#restore-modal').modal();
  $('#defaults-modal').modal();
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

$('#restore-defaults').click(() => {
  restore(`{"buttons": [], "themes": [${JSON.stringify(themesUtil.defaultTheme)}], "currentThemeIdx": 0, "plugins": []}`);
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

const keepAmount = $('#buttons-live-preview > li').length;
function updateButtonPreview() {
  $('#buttons-live-preview > li').slice(keepAmount).remove(); // Remove everything below the "Live Preview" header
  buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons-live-preview')[0]));
}

function loadButtons(callback) {
  storage.load('buttons', error => {
    if (error) {
      // FIXME
      callback(error);
      return;
    }
    buttons.forEach(buttonsUtil.addSettingCard);
    updateButtonPreview();
    $('#buttons-container input').on('change keyup paste', event => updateButtonPreview());
    callback(null);
  });
}

// FIXME
function runPlugins() {
  plugins.forEach((plugin, idx) => {
    pluginsUtil.appendPluginUI(plugin, idx);
    runViewContent(plugin, 'secondary');
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
});
