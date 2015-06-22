'use strict';
var addPlugin = new Button(undefined, undefined, 'Add Plugin');
var removePlugin = new Button(undefined, undefined, 'Remove Plugin');
var updatePlugin = new Button(undefined, undefined, 'Update Plugin');
var save = new Button(undefined, undefined, 'Save');
addButtonSeparator(byId('default-pane'));
var pluginSettings = new Button(undefined, undefined, 'Plugin Settings');
var buttonList = new Button(undefined, undefined, 'Button List');

removePlugin.anchor.addEventListener('click', function (e) {
  e.preventDefault();
  storage.remove('plugins', prompt('Plugin to remove:'));
});
save.anchor.addEventListener('click', function (e) {
  e.preventDefault();
  var keys = Object.keys(settings);
  for (var i = 0; i < keys.length; i++) {
    if (!settings[keys[i]].isVisible) continue;
    var input = byId(keys[i]);
    if (input === undefined || input === null) continue;
    settings[keys[i]].value = input.value;
  }
  var buttonIds = Object.keys(buttons);
  for (var i = 0; i < buttonIds.length; i++) {
    buttons[buttonIds[i]] = {
      text: byId(buttonIds[i] + 'Text').value,
      href: byId(buttonIds[i] + 'Link').value,
      imagePath: byId(buttonIds[i] + 'Image').value,
      position: byId(buttonIds[i] + 'Position').value
    }
  }
  storage.store('settings');
  storage.store('plugins');
  storage.store('buttons')
});
function showPane(id) {
  return function (e) {
    e.preventDefault();
    toggleDiv(byClass('focused')[0], true);
    toggleDiv(id);
  }
}
pluginSettings.anchor.addEventListener('click', showPane('settings-pane'));
buttonList.anchor.addEventListener('click', showPane('buttons-pane'));
function plugin(update) {
  return function (e) {
    e.preventDefault();
    byId('file-input').addEventListener('change', function (e) {addPlugins(e, update)}, false);
    byId('file-input').click();
  }
}
addPlugin.anchor.addEventListener('click', plugin(false));
updatePlugin.anchor.addEventListener('click', plugin(true));

setTimeout(function () {
  var addButton = new Button(undefined, undefined, 'Add new button', byId('buttons-pane'));
  addButton.anchor.addEventListener('click', function (e) {
    e.preventDefault();
    var id = prompt('Input a unique identifier for the button:');
    if (id === null) return;
    if (buttons[id] !== undefined && buttons[id] !== null) {
      alert('Identifier already exists.');
      return;
    }
    buttons[id] = {
      text: '',
      href: '',
      imagePath: ''
    };
    addButtonConfig(id);
  });
  var removeButton = new Button(undefined, undefined, 'Remove existing button', byId('buttons-pane'));
  removeButton.anchor.addEventListener('click', function (e) {
    e.preventDefault();
    delete buttons[prompt('Imput the button identifier:')];
    storage.store('buttons');
    location.reload(true);
  });
  function addButtonConfig(buttonId) {
    byId('buttons-pane').insertAdjacentHTML('beforeend',
    '<h1 class="global-text">Button '+buttonId+'</h1>' +
    '<h2 class="global-text">Text<input id="'+buttonId+'Text" type="string" value="'+buttons[buttonId].text+'"></input></h2>' +
    '<h2 class="global-text">Link<input id="'+buttonId+'Link" type="string" value="'+buttons[buttonId].href+'"></input></h2>' +
    '<h2 class="global-text">Image<input id="'+buttonId+'Image" type="string" value="'+buttons[buttonId].imagePath+'"></input></h2>' +
    '<h2 class="global-text">Position<input id="'+buttonId+'Position" type="number" value="'+buttons[buttonId].position+'"></input></h2>');
  }
  storage.load('buttons',
  function () {
    for (var i in buttons) addButtonConfig(i);
  }, function () {
    buttons = {};
  });
}, 0);

storage.load('settings', 
  settingsLoaded,
  function () {
    storage.add('settings', {
      name: 'Main page title',
      desc: 'Title displayed in the center of the main page.',
      type: 'string',
      isVisible: true
    }, {});
    settingsLoaded();
  }
);

function settingsLoaded() {
  storage.load('plugins', function () {
    for (var p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      try {if (plugins[p].secondary) eval('(' + plugins[p].secondary + ').apply(this, [])')}
      catch(e) {console.error('Execution failed: ' + e.message)}
    }
    addSettings();
  }, addSettings);
}

function addSettings() {
  for (var i in settings) {
     if (!settings[i].isVisible) continue;
     byId('settings-pane').insertAdjacentHTML('beforeend',
     '<h1 class="global-text">' + settings[i].name +
     '<small>  ' + settings[i].desc + '</small>' +
     '</h1>' +
     '<input id="' + settings[i].name + '" type="' + settings[i].type + '" value="' + settings[i].value + '">'
     );
  }
}

function addPlugins(event, allowUpdate) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onloadend = (function (fileIn) {
    return function (e) {
      if (fileIn.type !== "application/javascript") {
        alert("Please choose a .js file.");
        return;
      }
      var plugin = eval(e.target.result);
      if (plugin.init) plugin.init();
      // Serialize functions, if they exist
      if (typeof plugin.init === 'function') plugin.init = plugin.init.toString();
      if (typeof plugin.main === 'function') plugin.main = plugin.main.toString();
      if (typeof plugin.secondary === 'function') plugin.secondary = plugin.secondary.toString();
      storage.add('plugins', plugin, {update: allowUpdate});
    }
  })(file);
  reader.readAsText(file);
}