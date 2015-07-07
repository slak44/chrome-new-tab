'use strict';
var plugins = {};
var settings = {};
var buttons = {};

var storage = new function () {
  /*
    Existing storage objects. Usable as 'what' parameters.
    
    Plugin format:
      {
        name: 'displayName',
        desc: 'message',
        author: 'name',
        version: 'ver',
        init: function () {},
        main: function () {},
        secondary: function () {}
      }
    name: what it is.
    desc: what it does.
    author: self-explanatory.
    version: self-explanatory.
    These will be stored as strings:
    init: executed when the plugin is added.
    main: executed in the main page.
    secondary: executed in the options page.
    
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
    
    Button format:
      {
        imagePath: 'path',
        href: 'ref',
        text: 'text',
        position: 0,
        hotkey: 'K',
        openInNew: false
      }
    imagePath: path to image.
    href: where does it point to.
    text: displyed text.
    position: used to determine order of buttons.
    hotkey: using alt+key triggers the button.
    openInNew: if true, opens the link in a new tab that replaces this one.
  */
  this.stored = ['settings', 'plugins', 'buttons'];

  this.load = function (what, onLoad, onError) {
    chrome.storage.local.get('stored' + capitalize(what), function (data) {
      window[what] = data['stored' + capitalize(what)];
      // Make sure there's something there
      if (window[what] === undefined || window[what] === null || window[what] === {}) {
        console.log('No ' + what + ' found.');
        onError();
        return;
      }
      console.log('Done loading ' + what + '.');
      onLoad();
    });
  }
  
  this.add = function (what, toAdd, options) {
    options = (options)? options : {};
    window[what] = (window[what])? window[what] : {};
    if (toAdd === undefined || toAdd === null || typeof toAdd !== 'object' || toAdd === {}) throw new Error('Invalid argument: ' + toAdd);
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
    eval('chrome.storage.local.set({stored' + capitalize(what) + ': ' + what + '}, undefined)');
  }

  /*
    Wipes all storage, both in-memory and persistent.
  */
  this.clearStorage = function () {
    for (var i = 0; i < storage.stored.length; i++) eval(storage.stored[i] + ' = {}');
    chrome.storage.local.clear();
  }
  
  this.clear = function (what) {
    window[what] = {};
    eval('chrome.storage.local.set({stored' + capitalize(what) + ': {}}, undefined)');
  }
};

function Button(imagePath, href, text, parent, openInNew) {
  if (parent === undefined || parent === null ||
      parent.insertAdjacentHTML === undefined) parent = byId('default-pane');
  parent.insertAdjacentHTML('beforeend',
  '<a href="'+((href)? href : '')+'" class="button">' +
    ((imagePath)? '<img src="'+imagePath+'" class="button-img"></img>': '') +
    '<pre class="button-text">'+text+'</pre>' +
  '</a>');
  this.anchor = parent.children[parent.children.length - 1];
  this.name = text;
  if (href !== undefined && (href.indexOf('chrome://') === 0 || openInNew))
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

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
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
