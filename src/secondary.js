'use strict';
var identity = 'Options page';
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
      imagePath: byId(buttonIds[i] + 'Image').value
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
    if (buttons[id] !== undefined || buttons[id] !== null) {
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
    '<h2 class="global-text">Text</h2>' +
    '<input id="'+buttonId+'Text" type="string" value="'+buttons[buttonId].text+'"></input>' +
    '<h2 class="global-text">Link</h2>' +
    '<input id="'+buttonId+'Link" type="string" value="'+buttons[buttonId].href+'"></input>' +
    '<h2 class="global-text">Image</h2>' +
    '<input id="'+buttonId+'Image" type="string" value="'+buttons[buttonId].imagePath+'"></input>');
  }
  storage.load('buttons',
  function () {
    for (var i in buttons) addButtonConfig(i);
  }, function () {buttons = {}});
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
      try {eval(plugins[p].code)}
      catch(e) {console.error('Executing failed: ' + e.message)}
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
      if (allowUpdate) {
        var name = prompt('Plugin name:');
        storage.add('plugins', {
            name: name,
            desc: plugins[name].desc,
            code: e.target.result
          }, {update: allowUpdate});
      } else storage.add('plugins', {
          name: prompt('Plugin name:'),
          desc: prompt('Plugin description:'),
          code: e.target.result
        }, {update: false});
    }
  })(file);
  reader.readAsText(file);
}