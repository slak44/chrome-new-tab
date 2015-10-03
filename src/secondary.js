'use strict';
var save = createButton({text: 'Save'});
var jsonData = createButton({text: 'Backup and restore'});
addButtonSeparator(byId('default-pane'));
var addPlugin = createButton({text: 'Add Plugin'});
var removePlugin = createButton({text: 'Remove Plugin'});
addButtonSeparator(byId('default-pane'));
var pluginSettings = createButton({text: 'Plugin Settings'});
var buttonList = createButton({text: 'Button List'});

save.addEventListener('click', function (e) {
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
    openInNew: !!byId('buttonOpenInNew').checked
  };
  if (byId('json-in').value !== '') {
    var data = JSON.parse(byId('json-in').value);
    if (data.settingsData !== undefined && data.buttonsData !== undefined) {
      settings = data.settingsData;
      buttons = data.buttonsData;
    }
  }
  storage.store('settings');
  storage.store('plugins');
  storage.store('buttons');
});
function showPane(id) {
  return function (e) {
    e.preventDefault();
    toggleDiv(byClass('focused')[0], true);
    toggleDiv(id);
  };
}
pluginSettings.addEventListener('click', showPane('settings-pane'));
buttonList.addEventListener('click', showPane('buttons-pane'));
jsonData.addEventListener('click', showPane('json-pane'));
addPlugin.addEventListener('click', function (e) {
  e.preventDefault();
  byId('file-input').addEventListener('change', function (e) {addPlugins(e, true);}, false);
  byId('file-input').click();
});
removePlugin.addEventListener('click', function (e) {
  e.preventDefault();
  storage.remove('plugins', prompt('Plugin to remove:'));
});

async.parallel([loadButtons, loadSettings, configureButtonPane], function (err) {
  if (err) throw err;
  byId('json-out').innerHTML = JSON.stringify({
    settingsData: settings,
    buttonsData: buttons
  });
});

function configureButtonPane(cb) {
  var addButton = createButton({text: 'Add new button', parent: byId('buttons-pane')});
  addButton.addEventListener('click', function (e) {
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
  var removeButton = createButton({text: 'Remove this button', parent: byId('buttons-pane')});
  removeButton.addEventListener('click', function (e) {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this button?')) return;
    delete buttons[getSelectedButtonId()];
    storage.store('buttons');
  });
  cb();
}

function loadButtons(cb) {
  storage.load('buttons',
  function (error) {
    if (error || Object.keys(buttons).length === 0) {
      buttons = {};
      return;
    }
    var select = byId('buttons-list');
    select.addEventListener('change', function (e) {
      var index = getSelectedButtonId();
      byId('buttonText').value = buttons[index].text;
      byId('buttonLink').value = buttons[index].href;
      byId('buttonImage').value = buttons[index].imagePath;
      byId('buttonPosition').value = buttons[index].position;
      byId('buttonHotkey').value = buttons[index].hotkey;
      byId('buttonOpenInNew').checked = buttons[index].openInNew;
    });
    for (var id in buttons) select.insertAdjacentHTML('beforeend', '<option>' + id + '</option>');
    addButtonConfig(getSelectedButtonId());
    cb();
  });
}

function loadSettings(cb) {
  storage.load('settings', 
    function (error) {
      if (error) {
        storage.add('settings', {
          name: 'Main page title',
          desc: 'Title displayed in the center of the main page.',
          type: 'string',
          isVisible: true
        }, {});
      }
      for (var i in settings) {
         if (!settings[i].isVisible) continue;
         byId('settings-pane').insertAdjacentHTML('beforeend',
         '<h1 class="global-text">' + settings[i].name +
         '<small>  ' + settings[i].desc + '</small>' +
         '</h1>' +
         '<input id="' + settings[i].name + '" type="' + settings[i].type + '" value="' + settings[i].value + '">'
         );
      }
      loadPlugins(cb);
    }
  );
}

function loadPlugins(cb) {
  storage.load('plugins', function (error) {
    if (!error) for (var p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      /*jshint -W061*/
      try {if (plugins[p].secondary) eval('(' + plugins[p].secondary + ').apply(this, [])');}
      catch(e) {console.error('Execution failed: ' + e.message);}
    }
    cb();
  });
}

function addButtonConfig(buttonId) {
  byId('buttons-pane').insertAdjacentHTML('beforeend',
  '<h2 class="global-text">Text<input id="buttonText" type="string" value="'+buttons[buttonId].text+'"></input></h2>' +
  '<h2 class="global-text">Link<input id="buttonLink" type="string" value="'+buttons[buttonId].href+'"></input></h2>' +
  '<h2 class="global-text">Image<input id="buttonImage" type="string" value="'+buttons[buttonId].imagePath+'"></input></h2>' +
  '<h2 class="global-text">Position<input id="buttonPosition" type="number" value="'+buttons[buttonId].position+'"></input></h2>' +
  '<h2 class="global-text">Hotkey<input id="buttonHotkey" type="string" maxlength="1" value="'+buttons[buttonId].hotkey+'"></input></h2>' +
  '<h2 class="global-text">Open in a new tab<input id="buttonOpenInNew" type="checkbox" checked="'+buttons[buttonId].openInNew+'"></input></h2>');
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
      /*jshint -W061*/
      var plugin = eval(e.target.result);
      if (plugin.init) plugin.init();
      // Serialize functions, if they exist
      if (typeof plugin.init === 'function') plugin.init = plugin.init.toString();
      if (typeof plugin.main === 'function') plugin.main = plugin.main.toString();
      if (typeof plugin.secondary === 'function') plugin.secondary = plugin.secondary.toString();
      storage.add('plugins', plugin, {update: allowUpdate});
    };
  })(file);
  reader.readAsText(file);
}