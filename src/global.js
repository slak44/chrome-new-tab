'use strict';
var plugins = {};
var settings = {};

var storage = new function () {
  /*
    Plugin format:
      {
        name: 'displayName',
        desc: 'message',
        code: 'code'
      }
    name: what it is.
    desc: what it does.
    code: executable js to be eval'd.
  */
  this.loadPlugins = function (onLoad, onError) {
    new Promise(function (resolve, reject) {
      chrome.storage.local.get("storedPlugins", function (data) {
        plugins = data.storedPlugins;
        if (plugins === undefined || plugins === null || plugins === {}) reject("No plugins found.");
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
    type: what kind of input is necessary. (number, string, checkbox, radiobox, etc)
    value: undefined until set.
    isVisible: if false, it means the setting is just storage.
  */
  this.loadSettings = function (onLoad, onError) {
    new Promise(function (resolve, reject) {
      chrome.storage.local.get("storedSettings", function (data) {
        settings = data.storedSettings;
        // Make sure there's something there
        if (settings === undefined || settings === null || settings === {}) {
          reject("Settings are empty.");
          return;
        }
        // If a visible value is empty, it fails immediately
        for (var e in settings)
          if (settings[e].isVisible && settings[e].value === undefined) reject("Visible setting value missing.");
        resolve("Done fetching settings.");
      });
    }).then(
      function(res) {
        console.log(res);
        onLoad();
      },
      function(err) {
        console.log(err);
        onError();
      }
    );
  }
  
  this.addSetting = function (setting, options) {
    options = (options)? options : {};
    settings = (settings)? settings : {};
    if (setting === undefined || setting === null || typeof setting !== 'object' || setting === {}) throw new Error('Invalid argument.');
    if (settings[setting.name] !== undefined) {
      if (options.definition) return;
      if (!options.update && setting.name === settings[setting.name].name) throw new Error('Already exists, use update.');
    }
    settings[setting.name] = setting;
    this.storeSettings();
  }
  
  this.addPlugin = function (plugin, options) {
    options = (options)? options : {};
    plugins = (plugins)? plugins: {};
    if (plugin === undefined || plugin === null || typeof plugin !== 'object' || plugin === {}) throw new Error('Invalid argument.');
    if (plugins[plugin.name] !== undefined) {
      if (!options.update && plugins[plugin.name].name === name) throw new Error('Already exists, use update.');
    }
    plugins[plugin.name] = plugin;
    this.storePlugins();
  }
  
  this.removePlugin = function (name) {
    delete plugins[name];
    this.storePlugins();
  }
  
  this.removeSetting = function (name) {
    delete settings[name];
    this.storeSettings();
  }
  
  this.storeSettings = function () {
    chrome.storage.local.set({"storedSettings": settings}, undefined);
  }

  this.storePlugins = function () {
    chrome.storage.local.set({"storedPlugins": plugins}, undefined);
  }

  /*
    Wipes all storage, both in-memory and persistent.
  */
  this.clearStorage = function () {
    settings = {};
    plugins = {};
    chrome.storage.local.clear();
  }
  
  this.clearSettings = function () {
    settings = {};
    chrome.storage.local.set({"storedSettings": {}}, undefined);
  }
  
  this.clearPlugins = function () {
    plugins = {};
    chrome.storage.local.set({"storedPlugins": {}}, undefined);
  }
};

function Button(imagePath, href, text, parent) {
  if (parent === undefined || parent === null ||
      parent.insertAdjacentHTML === undefined) parent = byId('default-pane');
  parent.insertAdjacentHTML('beforeend',
  '<a href="'+href+'" class="button">' +
    ((imagePath)? '<img src="'+imagePath+'" class="button-img"></img>': '') +
    '<pre class="button-text">'+text+'</pre>' +
  '</a>');
  this.aHref = parent.children[parent.children.length - 1];
  this.name = text;
}

function byId(id) {
  return document.getElementById(id);
}

function toggleDiv(id) {
  $('#' + id).toggleClass('unfocused').toggleClass('focused');
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
