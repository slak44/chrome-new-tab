'use strict';

window.dependencies = {};

window.Materialize = require('materialize-css');

window.plugins = [];
window.buttons = [];
window.colorSchemes = [];

window.byId = id => document.getElementById(id);
window.byClass = className => document.getElementsByClassName(className);
window.byQSelect = selector => document.querySelector(selector);

window.capitalize = string => string.charAt(0).toUpperCase() + string.substr(1);
window.hasClass = (element, className) => Array.from(element.classList).includes(className);

window.SHORT_DURATION_MS = 3000; // 3 seconds
window.LONG_DURATION_MS = 10000; // 10 seconds

// /*
//   Reads a File object and returns the File object and the contents in a callback.
// */
// window.readFile = (file, callback) => {
// const reader = new FileReader();
// reader.addEventListener('loadend', event => {
//   callback(null, file, event.target.result);
// });
// reader.readAsText(file);
// };
//
// /*
//   Prompts the user for a file, and returns the File object and the contents in a callback.
// */
// window.getFile = callback => {
//   byId('file-input').onchange = event => {
//     const file = event.target.files[0];
//     window.readFile(file, callback);
//   };
//   byId('file-input').click();
// };

/*
  Handles localStorage access.
*/
window.storage = new (function () {
  const self = this;

  /*
    Constant.
    Existing storage elements. Usable as 'element' parameters for the other functions in this object.
  */
  this.stored = ['plugins', 'buttons', 'colorSchemes'];
  Object.freeze(this.stored);

  /*
    Checks whether or not an element is being stored in this object.
  */
  this.isStored = element => this.stored.includes(element);

  /*
    Private utility function that throws an error if the element is not in the `stored` array.
  */
  function throwIfNotStored(element) {
    if (!self.isStored(element)) throw new Error(`The element ${element} does not exist in this object`);
  }

  /*
    Private utility function that returns where in local storage was the element placed.
  */
  function storedNameFrom(element) {
    return `stored${capitalize(element)}`;
  }

  /*
    Load a stored element in a global object with the same name.
  */
  this.load = function (element, callback) {
    throwIfNotStored(element);
    chrome.storage.local.get(storedNameFrom(element), data => {
      if (data && data[storedNameFrom(element)]) {
        window[element] = data[storedNameFrom(element)];
        callback(null);
      } else {
        self.store(element, callback);
      }
    });
  };

  /*
    Stores an element in the browser storage.
    The name used for storage is 'stored' + the name of the element, capitalized.
    To store a new element, it must be first added to the `stored` array.
  */
  this.store = function (element, callback) {
    throwIfNotStored(element);
    const objToStore = {};
    objToStore[storedNameFrom(element)] = window[element];
    chrome.storage.local.set(objToStore, callback);
  };

  /*
    Deletes all elements, both from their respective global objects and from the storage.
  */
  this.clearStorage = function () {
    this.stored.forEach(element => delete window[element]);
    chrome.storage.local.clear();
  };

  /*
    Only deletes a single element.
  */
  this.clear = function (element, callback) {
    throwIfNotStored(element);
    delete window[element];
    const objToStore = {};
    objToStore[storedNameFrom(element)] = {};
    chrome.storage.local.set(objToStore, callback);
  };
})();

/*
  Provides utilities for plugins. Each plugin should create its own instance.
*/
window.PluginUtil = function (plugin) {
  /*
    Get the value of a setting by its name.
  */
  this.getSetting = function (settingName) {
    return plugin.settings.filter(settingObj => settingObj.name === settingName)[0].value;
  };

  /*
    Dynamically adds a plugin's css.
  */
  this.insertStyles = function (cssText) {
    byId('plugin-css').innerHTML += cssText;
  };

  /*
    Shortcut to plugin dependencies.
  */
  this.deps = window.dependencies[plugin.name];
};

window.activateScheme = function (scheme) {
  const primaryTextColor = scheme.isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.75)';
  const secondaryTextColor = '#9E9E9E';
  byId('dynamic-colors').innerText = `
    input:focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {
      border-bottom-color: ${scheme.main} !important;
      box-shadow: 0 1px 0 0 ${scheme.main} !important;
    }
    input:focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {
      color: ${scheme.main} !important;
    }
    [type="checkbox"]:checked + label:before {
      border-bottom-color: ${scheme.main} !important;
      border-right-color: ${scheme.main} !important;
    }
    .input-field i.prefix.active {color: ${scheme.main} !important;}
    .collection-item.active {background-color: ${scheme.darken4} !important;}
    nav {background-color: ${scheme.main} !important;}
    .text-primary {color: ${primaryTextColor} !important;}
    .waves-effect .waves-ripple {background-color: ${scheme.isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.2);'} !important;}
    body {background-color: ${scheme.background} !important;}
    .btn-floating {background-color: ${scheme.accent2} !important;}
    .btn-floating i {color: ${primaryTextColor} !important;}
    .tabs li.indicator {background-color: ${scheme.accent2} !important;}
    .tabs li a {color: ${primaryTextColor} !important;}
    .tabs li a.active {color: ${scheme.accent4} !important;}
    .collapsible > li {background-color: ${scheme.isDark ? '#000000' : '#FFFFFF'} !important;}
    .selected {background-color: ${scheme.accent1} !important;}
  `;
};

// window.toggleDiv = function (elem) {
//   let div = elem;
//   if (!(div instanceof HTMLElement)) div = byId(elem);
//   if (hasClass(div, 'focused')) {
//     div.classList.remove('focused');
//     div.classList.add('unfocused');
//   } else {
//     div.classList.remove('unfocused');
//     div.classList.add('focused');
//   }
// };

window.loadSchemes = function (callback) {
  storage.load('colorSchemes', err => {
    if (err || colorSchemes[0] === undefined || colorSchemes[0] === null) {
      colorSchemes = [{
        name: 'Light Orange with Light Green Accents',
        isDark: false,

        background: '#FAFAFA',

        lighten5: '#fff3e0',
        lighten4: '#ffe0b2',
        lighten3: '#ffcc80',
        lighten2: '#ffb74d',
        lighten1: '#ffa726',

        main: '#ff9800',

        darken1: '#fb8c00',
        darken2: '#f57c00',
        darken3: '#ef6c00',
        darken4: '#e65100',

        accent1: '#CCFF90',
        accent2: '#B2FF59',
        accent3: '#76FF03',
        accent4: '#558B2F'
      }];
      storage.store('colorSchemes', callback);
      return;
    }
    callback(null);
  });
};

window.runViewContent = function (plugin, view) {
  try {
    if (plugin.dependencyCode && view === 'global') eval(plugin.dependencyCode);
    if (plugin.html[view]) Object.keys(plugin.html[view]).forEach((selector, i, array) => {
      byQSelect(selector).insertAdjacentHTML('beforeend', array[selector]);
    });
    if (plugin.css[view]) pluginCss.innerHTML += plugin.css[view];
    if (plugin.js[view]) eval(plugin.js[view]);
  } catch (err) {
    Materialize.toast($(`<span>Plugin ${plugin.name} encountered an error</span>`), SHORT_DURATION_MS);
    console.error(`Execution for ${plugin.name} failed in ${view}: `, err);
  }
};

window.undoToast = function (text, uid, undoClicked) {
  const content = $(`<span>${text}</span>`)
    .add($(`<button id="undo-${uid}" class="btn-flat toast-action">Undo</button>`));
  Materialize.toast(content, LONG_DURATION_MS);
  const undoBtn = $(`#undo-${uid}`);
  undoBtn.click(event => {
    undoClicked();
    undoBtn.parent()[0].M_Toast.remove();
  });
};

window.loadPlugins = function (callback) {
  document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
  window.pluginCss = byId('plugin-css');
  storage.load('plugins', error => {
    if (error) {
      callback(error);
      return;
    }
    plugins.forEach(plugin => runViewContent(plugin, 'global'));
    callback(null);
  });
};
