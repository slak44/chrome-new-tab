'use strict';
var settings = {};
loadPlugins(executePluginsOnLoad);
checkSettings();

function checkSettings() {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedSettings", function(data){
      settings = data.storedSettings;
      if (data.storedSettings == undefined) reject("Failed to load settings.");
      else resolve("Done fetching settings.");
    });
  }).then(
    function(res) {
      /*Settings present; load the data.*/
      console.log(res);
      setTimeout(manipulateDOM, 0);
      executeSettingsOnLoad();
    },
    function(err) {
      /*Settings not present; prompt for data, store data, load the data.*/
      console.log(err);
      settings = {};
      settings.name = prompt("Please input a title:");
      settings.redditUser = prompt("Please input your reddit username:");
      settingsConfig.push(function(callback) {chrome.storage.local.set({"storedSettings": settings}, callback);});
      settingsConfig.push(executeSettingsOnLoad);
      queue(settingsConfig, window);
      manipulateDOM();
    }
  );
}

function executeSettingsOnLoad() {
  for (var i = 0; i < onSettingsLoad.length; i++) onSettingsLoad[i]();
}

function executePluginsOnLoad() {
  for (var i = 0; i < plugins.length; i++) plugins[i].execute();
}
