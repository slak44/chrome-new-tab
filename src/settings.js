'use strict';
loadPlugins(executePluginsOnLoad);
loadSettings(settingsPresent, settingsAbsent);

function executeSettingsOnLoad() {
  for (var i = 0; i < onSettingsLoad.length; i++) onSettingsLoad[i]();
}

function executePluginsOnLoad() {
  for (var i = 0; i < plugins.length; i++) plugins[i].execute();
}

/*Settings not present; prompt for data, store data, load the data.*/
function settingsAbsent() {
  settings.name = prompt("Please input a title:");
  settings.redditUser = prompt("Please input your reddit username:");
  settingsConfig.push(function(callback) {chrome.storage.local.set({"storedSettings": settings}, callback);});
  settingsConfig.push(executeSettingsOnLoad);
  queue(settingsConfig, window);
  manipulateDOM();
}

/*Settings present; load the data.*/
function settingsPresent() {
  setTimeout(manipulateDOM, 0);
  executeSettingsOnLoad();
}
