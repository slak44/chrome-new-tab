'use strict';
var plugins = {};
var settings = {};
var buttons = {};

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
      chrome.storage.local.get('storedSettings', function (data) {
        settings = data.storedSettings;
        // Make sure there's something there
        if (settings === undefined || settings === null || settings === {}) {
          reject('Settings are empty.');
          return;
        }
        // If a visible value is empty, it fails immediately
        for (var e in settings)
          if (settings[e].isVisible && settings[e].value === undefined) reject('Visible setting value missing.');
        resolve('Done fetching settings.');
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
  
  /*
    Button format:
      {
        imagePath: 'path',
        href: 'ref',
        text: 'text'
        parent: HTMLElement
      }
      imagePath: path to image.
      href: where does it point to.
      text: displyed text.
      parent: to whom it must be added.
  */
  this.loadButtons = function (onLoad, onError) {
    new Promise(function (resolve, reject) {
      chrome.storage.local.get('storedButtons', function (data) {
        buttons = data.storedButtons;
        // Make sure there's something there
        if (buttons === undefined || buttons === null || buttons === {}) {
          reject('No buttons found.');
          return;
        }
        resolve('Done loading buttons.');
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
  
  this.add = function (what, toAdd, options) {
    options = (options)? options : {};
    plugins = (plugins && what === 'plugins')? plugins : {};
    settings = (settings && what === 'settings')? settings : {};
    if (toAdd === undefined || toAdd === null || typeof toAdd !== 'object' || toAdd === {}) throw new Error('Invalid argument.');
    if (window[what][toAdd.name] !== undefined) {
      if (options.definition) return;
      if (!options.update && toAdd.name === window[what][toAdd.name].name) throw new Error('Already exists, use update.');
    }
    window[what][toAdd.name] = toAdd;
    this.store(what);
  }
  
  this.remove = function (what, name) {
    delete window[what][name];
    this.store(what);
  }
  
  this.store = function (what) {
    //TODO
  }

  /*
    Wipes all storage, both in-memory and persistent.
  */
  this.clearStorage = function () {
    settings = {};
    plugins = {};
    buttons = {};
    chrome.storage.local.clear();
  }
  
  this.clear = function (what) {
    window[what] = {};
    var storageStr = 'stored' + what.charAt(0).toUpperCase() + what.substr(1);
    chrome.storage.local.set({storageStr: {}}, undefined);
  }
};

function Button(imagePath, href, text, parent) {
  if (parent === undefined || parent === null ||
      parent.insertAdjacentHTML === undefined) parent = byId('default-pane');
  parent.insertAdjacentHTML('beforeend',
  '<a href="'+((href)? href : '')+'" class="button">' +
    ((imagePath)? '<img src="'+imagePath+'" class="button-img"></img>': '') +
    '<pre class="button-text">'+text+'</pre>' +
  '</a>');
  this.anchor = parent.children[parent.children.length - 1];
  this.name = text;
  if (href !== undefined && href.indexOf('chrome://') === 0)
    this.anchor.addEventListener('click', function (e) {chrome.tabs.create({url: href}); window.close()});
}

function addButtonSeparator(parent) {
  parent.insertAdjacentHTML('beforeend', '<span class="button-separator"></span>');
}

function byId(id) {
  return document.getElementById(id);
}

function byClass(className) {
  return document.getElementsByClassName(className);
}

function toggleDiv(id, isElement) {
  if (!isElement) id = byId(id);
  // if 'focused' in element.classList
  if (Array.prototype.indexOf.apply(id.classList, ['focused']) > -1) {
    id.classList.remove('focused');
    id.classList.add('unfocused');
  } else {
    id.classList.remove('unfocused');
    id.classList.add('focused');
  }
}
