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
      /*Settings not present; prompt for data, get playerId, store data, load the data.*/
      console.log(err);
      promptSettings();
      addFunction(settingsConfig, function(callback) {chrome.storage.local.set({"storedSettings": settings}, callback);});
      addFunction(settingsConfig, executeOnLoad);
      queue(settingsConfig, window);
      manipulateDOM();
    }

  );
}

function promptSettings() {
  settings = {};
  settings.name = prompt("Please input a title:");
  settings.redditUser = prompt("Please input your reddit username:");
}

function executeOnLoad() {
  for (var i = 0; i < onSettingsLoad.length; i++) onSettingsLoad[i]();
}

function queue(funcs, scope) {
  (function next() {
    if (funcs.length > 0) funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
  })();
};

function getMonthName(monthNumeral) {
  switch (monthNumeral) {
  case  0: return "January";
  case  1: return "February";
  case  2: return "March";
  case  3: return "April";
  case  4: return "May";
  case  5: return "June";
  case  6: return "July";
  case  7: return "August";
  case  8: return "September";
  case  9: return "October";
  case 10: return "November";
  case 11: return "December";
  default: return "What did you do with this method?"
  }
}
