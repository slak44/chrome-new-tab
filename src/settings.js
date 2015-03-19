'use strict';
var settings = {};
checkSettings();

/*Clear the storage.*/
function clearStorage() {
  settings = {};
  chrome.storage.local.clear();
}

function get(url, res) {
  new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) resolve(req.response);
      else reject(Error(req.statusText));
    };
    req.send();
  }).then(res, function(err) {console.log(err)});
}

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
      executeOnLoad();
    },
    function(err) {
      /*Settings not present; prompt for data, store data, load the data.*/
      console.log(err);
      settings = {};
      settings.name = prompt("Please input a title:");
      settings.redditUser = prompt("Please input your reddit username:");
      settingsConfig.push(function(callback) {chrome.storage.local.set({"storedSettings": settings}, callback);});
      settingsConfig.push(executeOnLoad);
      queue(settingsConfig, window);
      manipulateDOM();
    }

  );
}

function executeOnLoad() {
  for (var i = 0; i < onSettingsLoad.length; i++) onSettingsLoad[i]();
}

function queue(funcs, scope) {
  (function next() {
    if (funcs.length > 0) funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
  })();
};
