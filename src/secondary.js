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
  buttons[getSelectedButtonId()] = {
    text: byId('buttonText').value,
    href: byId('buttonLink').value,
    imagePath: byId('buttonImage').value,
    position: byId('buttonPosition').value,
    hotkey: byId('buttonHotkey').value.toUpperCase(),
    openInNew: !!byId('buttonOpenInNew').value
  };
  storage.store('settings');
  storage.store('plugins');
  storage.store('buttons');
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
  function addButtonConfig(buttonId) {
    byId('buttons-pane').insertAdjacentHTML('beforeend',
    '<h2 class="global-text">Text<input id="buttonText" type="string" value="'+buttons[buttonId].text+'"></input></h2>' +
    '<h2 class="global-text">Link<input id="buttonLink" type="string" value="'+buttons[buttonId].href+'"></input></h2>' +
    '<h2 class="global-text">Image<input id="buttonImage" type="string" value="'+buttons[buttonId].imagePath+'"></input></h2>' +
    '<h2 class="global-text">Position<input id="buttonPosition" type="number" value="'+buttons[buttonId].position+'"></input></h2>' +
    '<h2 class="global-text">Hotkey<input id="buttonHotkey" type="string" maxlength="1" value="'+buttons[buttonId].hotkey+'"></input></h2>' +
    '<h2 class="global-text">Open in a new tab<input id="buttonOpenInNew" type="checkbox" value="'+buttons[buttonId].openInNew+'"></input></h2>');
  }
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
      imagePath: '',
      hotkey: ''
    };
    byId('buttons-list').insertAdjacentHTML('beforeend', '<option>' + id + '</option>');
    if (Object.keys(buttons).length === 1) addButtonConfig(id);
  });
  var removeButton = new Button(undefined, undefined, 'Remove this button', byId('buttons-pane'));
  removeButton.anchor.addEventListener('click', function (e) {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this button?')) return;
    delete buttons[getSelectedButtonId()];
    storage.store('buttons');
  });
  storage.load('buttons',
  function () {
    if (Object.keys(buttons).length === 0) return;
    var select = byId('buttons-list');
    select.addEventListener('change', function (e) {
      var index = getSelectedButtonId();
      byId('buttonText').value = buttons[index].text;
      byId('buttonLink').value = buttons[index].href;
      byId('buttonImage').value = buttons[index].imagePath;
      byId('buttonPosition').value = buttons[index].position;
      byId('buttonHotkey').value = buttons[index].hotkey;
    });
    for (var id in buttons) select.insertAdjacentHTML('beforeend', '<option>' + id + '</option>');
    addButtonConfig(getSelectedButtonId());
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

function getSelectedButtonId() {
  var select = byId('buttons-list');
  return select.options[select.selectedIndex].text;
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