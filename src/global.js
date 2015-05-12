'use strict';
var plugins = [];
var settings = [];

// function Plugin(code, title) {
//   this.code = code;
//   this.title = title;
// 
//   var element = document.createElement("li");
//   var text = document.createElement("pre");
//   $(text).toggleClass("globalText");
//   text.innerHTML = title;
//   element.id = title;
//   element.appendChild(text);
//   this.display = element;
//   this.serializableNode = this.display.outerHTML;
// }

// function Setting(promptMessage, src, buttonText, isVisible) {
//   this.isVisible = (isVisible === undefined)? true : isVisible;
//   this.button = new Button(undefined, undefined, buttonText, true);
//   this.promptMessage = promptMessage;
//   this.src = src;
//   $(this.button).click(function() {
//     settings[this.id].value = prompt(promptMessage);
//     storeSettings();
//   });
//   try {if (settings[buttonText].value === undefined) settings[buttonText] = this;}
//   catch (err) {settings[buttonText] = this;}
//   storeSettings();
// }

function Button(imagePath, href, text, parent) {
  if (parent === undefined || parent === null ||
      parent.insertAdjacentHTML === undefined) parent = byId('default-pane');
  parent.insertAdjacentHTML('beforeend',
  '<a href="'+href+'" class="button">\
    <img src="'+imagePath+'" class="button-img"></img>\
    <pre class="button-text">'+text+'</pre>\
  </a>');
  this.aHref = parent.children[parent.children.length - 1];
  this.name = text;
}

function byId(id) {
  return document.getElementById(id);
}

function showDiv(id) {
  $('#' + id).toggleClass('unfocused').toggleClass('focused');
}

function loadPlugins(onLoad, onError) {
  new Promise(function (resolve, reject) {
    chrome.storage.local.get("storedPlugins", function (data) {
      plugins = data.storedPlugins;
      if (plugins === undefined || plugins === null || plugins === []) reject("No plugins found.");
      else resolve("Done fetching plugins.");
    });
  }).then(
    function (res) {
      console.log(res);
      onLoad();
    },
    function (err) {
      console.log(err);
      onError();
    }
  );
}

/*
  Setting format:
    {
      name: 'displayName',
      desc: 'message',
      type: 'type',
      value: undefined,
      isVisible: true
    }
  name: title of setting.
  desc: description of setting.
  type: what kind ofinput is necessary. (number, string, checkbox, radiobox, etc)
  value: undefined until set.
  isVisible: if false, it means the setting is just storage.
*/
function loadSettings(onLoad, onError) {
  new Promise(function (resolve, reject) {
    chrome.storage.local.get("storedSettings", function (data) {
      settings = data.storedSettings;
      // Make sure there's something there
      if (settings === undefined || settings === null || settings === []) {
        reject("Settings are empty.");
        return;
      }
      // If a visible value is empty, it fails immediately
      for (var i = 0; i < settings.length; i++)
        if (settings[i].isVisible && settings[i].value === undefined) reject("Visible setting value missing.");
      resolve("Done fetching settings.");
    });
  }).then(
    function(res) {
      console.log(res);
      onLoad();
    },
    function(err) {
      console.log(err);
      settings = [];
      onError();
    }
  );
}

function storeSettings() {
  chrome.storage.local.set({"storedSettings": settings}, undefined);
}

function storePlugins() {
  chrome.storage.local.set({"storedPlugins": plugins}, undefined);
}

/*
  Wipe all storage, both in-memory and persistent.
*/
function clearStorage() {
  settings = [];
  plugins = [];
  chrome.storage.local.clear();
}
function clearSettings() {
  chrome.storage.local.set({"storedSettings": []}, undefined);
}
function clearPlugins() {
  chrome.storage.local.set({"storedPlugins": []}, undefined);
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

/*
  Queues async tasks one after another.
  Each function must have the first parameter a callback, that is called at the end of the async job.
*/
function queue(funcs, scope) {
  (function next() {
    if (funcs.length > 0) funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
  })();
};
