'use strict';

window.dependencies = {};

window.jQuery = require('jquery');
require('materialize-css');

window.plugins = {};
window.buttons = {};
window.colorSchemes = [];

window.byId = id => document.getElementById(id);
window.byClass = className => document.getElementsByClassName(className);
window.byQSelect = selector => document.querySelector(selector);

window.capitalize = string => string.charAt(0).toUpperCase() + string.substr(1);
window.hasClass = (element, className) => Array.from(element.classList).includes(className);

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
    Load a stored element in a global object with the same name.
  */
  this.load = function (element, callback) {
    throwIfNotStored(element);
    chrome.storage.local.get(`stored${capitalize(element)}`, function (data) {
      window[element] = data[`stored${capitalize(element)}`];
      if (window[element] === undefined || window[element] === null) {
        callback(new Error(`No ${element} found.`));
        return;
      }
      callback(null);
    });
  };
  
  /*
    Stores an element in the browser storage.
    The name used for storage is 'stored' + the name of the element, capitalized.
    To store a new element, it must be first added to the `stored` array.
  */
  this.store = function (element, callback) {
    throwIfNotStored(element);
    let objToStore = {};
    objToStore[`stored${capitalize(element)}`] = window[element];
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
    let objToStore = {};
    objToStore[`stored${capitalize(element)}`] = {};
    chrome.storage.local.set(objToStore, callback);
  };
})();

/*
  Provides utilities for plugins. Each plugin should create its own instance.
*/
window.PluginUtil = function (pluginName) {
  /*
    Get the value of a setting by its name.
  */
  this.getSetting = function (settingName) {
    return plugins[pluginName].settings.filter(settingObj => settingObj.name === settingName)[0].value;
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
  this.deps = window.dependencies[pluginName];
};

window.activateScheme = function (scheme) {
  let css = `
  .color {color: ${scheme.main} !important;}
  .bgcolor {background-color: ${scheme.main} !important;}
  `;
  // There are 5 light colors and 4 dark/accent
  const colorCount = 4;
  for (let i = 1; i <= colorCount; i++) {
    css +=
    `
    .color.darken-${i} {color: ${scheme[`darken${i}`]} !important;}
    .color.lighten-${i} {color: ${scheme[`lighten${i}`]} !important;}
    .color.accent-${i} {color: ${scheme[`accent${i}`]} !important;}
    
    .bgcolor.darken-${i} {background-color: ${scheme[`darken${i}`]} !important;}
    .bgcolor.lighten-${i} {background-color: ${scheme[`lighten${i}`]} !important;}
    .bgcolor.accent-${i} {background-color: ${scheme[`accent${i}`]} !important;}
    `;
  }
  css += `
  .color.lighten-5 {color: ${scheme.lighten5} !important;}
  .bgcolor.lighten-5 {background-color: ${scheme.lighten5} !important;}
  `;
  
  css += `
  input[type=text]:focus:not([readonly]), input[type=password]:focus:not([readonly]), input[type=email]:focus:not([readonly]), input[type=url]:focus:not([readonly]),
  input[type=time]:focus:not([readonly]), input[type=date]:focus:not([readonly]), input[type=datetime-local]:focus:not([readonly]), input[type=tel]:focus:not([readonly]),
  input[type=number]:focus:not([readonly]), input[type=search]:focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {
    border-bottom-color: ${scheme.main} !important;
    box-shadow: 0 1px 0 0 ${scheme.main} !important;
  }
  input[type=text]:focus:not([readonly]) + label, input[type=password]:focus:not([readonly]) + label, input[type=email]:focus:not([readonly]) + label,
  input[type=url]:focus:not([readonly]) + label, input[type=time]:focus:not([readonly]) + label, input[type=date]:focus:not([readonly]) + label,
  input[type=datetime-local]:focus:not([readonly]) + label, input[type=tel]:focus:not([readonly]) + label, input[type=number]:focus:not([readonly]) + label,
  input[type=search]:focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {
    color: ${scheme.main} !important;
  }
  
  [type="checkbox"]:checked + label:before {
    border-bottom-color: ${scheme.main} !important;
    border-right-color: ${scheme.main} !important;
  }
  
  .collection-item.active {background-color: ${scheme.darken4} !important;}
  `;
  
  if (scheme.isDark) {
    // TODO
  }
  
  byId('dynamic-colors').innerHTML = css;
};

window.toggleDiv = function (elem) {
  if (!(elem instanceof HTMLElement)) elem = byId(elem);
  if (hasClass(elem, 'focused')) {
    elem.classList.remove('focused');
    elem.classList.add('unfocused');
  } else {
    elem.classList.remove('unfocused');
    elem.classList.add('focused');
  }
};

window.loadSchemes = function (callback) {
  storage.load('colorSchemes', function (err) {
    if (err || colorSchemes[0] === undefined || colorSchemes[0] === null) {
      colorSchemes = [{
        name: 'Light Orange with Lime Accents',
        isDark: false,
        
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
        
        accent1: '#F4FF81',
        accent2: '#EEFF41',
        accent3: '#C6FF00',
        accent4: '#AEEA00'
      }];
      storage.store('colorSchemes');
    }
    callback();
  });
};

window.loadPlugins = function (callback) {
  document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
  window.pluginCss = byId('plugin-css');
  storage.load('plugins',
  function (error) {
    if (error) {
      callback(error);
      return;
    }
    Object.keys(plugins).forEach(function (pluginName, i, array) {
      try {
        if (plugins[pluginName].dependencyCode) eval(plugins[pluginName].dependencyCode);
        if (plugins[pluginName].html.global) Object.keys(plugins[pluginName].html.global).forEach(function (selector, i, array) {
          byQSelect(selector).insertAdjacentHTML('beforeend', plugins[pluginName].html.global[selector]);
        });
        if (plugins[pluginName].css.global) pluginCss.innerHTML += plugins[pluginName].css.global;
        if (plugins[pluginName].js.global) eval(plugins[pluginName].js.global);
      } catch (err) {
        console.error(`Execution for ${pluginName} failed: `, err);
      }
    });
    callback(null);
  });
};
