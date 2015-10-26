'use strict';
var addPlugin = createButton({text: 'Add Plugin'});
var removePlugin = createButton({text: 'Remove Plugin'});

byId('floating-save-button').addEventListener('click', function (evt) {
  if (hasClass(byId('settings-tab'), 'focused')) {
		var keys = Object.keys(settings);
		for (var i = 0; i < keys.length; i++) {
			if (!settings[keys[i]].isVisible) continue;
			var input = byId(keys[i]);
			if (input === undefined || input === null) continue;
			settings[keys[i]].value = input.value;
		}
		storage.store('settings');
	} else if (hasClass(byId('buttons-tab'), 'focused')) {
		var id = byId('buttonText').getAttribute('data-button-id');
		if (id === '') return;
		buttons[id] = {
			text: byId('buttonText').value,
			href: byId('buttonLink').value,
			imagePath: byId('buttonImage').value,
			position: byId('buttonPosition').value,
			hotkey: byId('buttonHotkey').value.toUpperCase(),
			openInNew: !!byId('buttonOpenInNew').checked
		};
		storage.store('buttons');
	} else if (hasClass(byId('json-tab'), 'focused')) {
	  if (byId('json-in').value !== '') {
	    var data = JSON.parse(byId('json-in').value);
	    if (data.settingsData !== undefined && data.buttonsData !== undefined) {
	      settings = data.settingsData;
	      buttons = data.buttonsData;
	    }
	  }
		storage.store('settings');
		storage.store('buttons');
	}
});

function showTab(id) {
  return function (e) {
    e.preventDefault();
    toggleDiv(byClass('focused')[0], true);
    toggleDiv(id);
  };
}
byId('plugin-settings').addEventListener('click', showTab('settings-tab'));
byId('button-list').addEventListener('click', showTab('buttons-tab'));
byId('backup-and-restore').addEventListener('click', showTab('json-tab'));
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
  byId('add-buttons').addEventListener('click', function (e) {
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
      hotkey: '',
			order: '',
			checked: false
    };
		setCurrentButton(buttons[id], id);
    byId('buttons-list').insertAdjacentHTML('beforeend', '<li id="' + id + '"><a href="#!">' + id + '</a></li>');
    if (Object.keys(buttons).length === 1) addButtonConfig(id);
  });
	
  byId('remove-buttons').addEventListener('click', function (e) {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this button?')) return;
		var id = byId('buttonText').getAttribute('data-button-id');
    delete buttons[id];
		byId(id).parentNode.removeChild(byId(id));
		setCurrentButton(getFirstButton());
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
		addButtonConfig(Object.keys(buttons)[0]);
    var dropdown = byId('buttons-list');
    for (var id in buttons) {
			dropdown.insertAdjacentHTML('beforeend', '<li id="' + id + '"><a href="#!">' + id + '</a></li>');
			byId(id).addEventListener('click', (function (id) {
				return function (evt) {
					setCurrentButton(buttons[id], id);
				};
			})(id));
		}
    cb();
  });
}

function setCurrentButton(buttonData, id) {
	byId('buttonText').setAttribute('data-button-id', id);
	byId('buttonText').value = buttonData.text;
	byId('buttonLink').value = buttonData.href;
	byId('buttonImage').value = buttonData.imagePath;
	byId('buttonPosition').value = buttonData.position;
	byId('buttonHotkey').value = buttonData.hotkey;
	byId('buttonOpenInNew').checked = buttonData.openInNew;
}

function getFirstButton() {
	if (buttons === undefined || Object.keys(buttons).length === 0) return {
		id: '',
		text: '',
		href: '',
		imagePath: '',
		hotkey: '',
		order: '',
		checked: false
	};
	else return buttons[Object.keys(buttons)[0]];
}

function loadSettings(cb) {
  storage.load('settings', 
    function (error) {
      if (error) {
        storage.add('settings', {
          name: 'Main page title',
          desc: 'Title displayed in the center of the main page.',
          type: 'text',
          isVisible: true
        }, {});
      }
      for (var i in settings) {
        if (!settings[i].isVisible) continue;
				byId('settings-tab').insertAdjacentHTML('beforeend',
				'<div class="input-field">'+
          '<input id="' + settings[i].name + '" placeholder="' + settings[i].desc + '" type="' + settings[i].type + '" value="' + settings[i].value + '" class="">' +
          '<label for="' + settings[i].name + '" class="active">' + settings[i].name + '</label>' +
        '</div>'
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
  byId('buttons-tab').insertAdjacentHTML('beforeend',
	'<div class="input-field">'+
		'<input id="buttonText" type="text" class="" data-button-id="' + buttonId + '" value="' + buttons[buttonId].text + '">' +
		'<label for="buttonText" class="active">Text</label>' +
	'</div>' +
	'<div class="input-field">'+
		'<input id="buttonLink" type="url" class="validate" value="' + buttons[buttonId].href + '">' +
		'<label for="buttonLink" class="active">Link</label>' +
	'</div>' +
	'<div class="input-field">'+
		'<input id="buttonImage" type="url" class="validate" value="' + buttons[buttonId].imagePath + '">' +
		'<label for="buttonImage" class="active">Image</label>' +
	'</div>' +
	'<div class="input-field">'+
		'<input id="buttonPosition" type="number" class="" value="' + buttons[buttonId].position + '">' +
		'<label for="buttonPosition" class="active">Order</label>' +
	'</div>' +
	'<div class="input-field">'+
		'<input id="buttonHotkey" type="text" maxlength="1" class="" value="' + buttons[buttonId].hotkey + '">' +
		'<label for="buttonHotkey" class="active">Hotkey</label>' +
	'</div>' +
	'<div class="input-field left align-left">'+
		'<input id="buttonOpenInNew" type="checkbox" class="" checked="' + buttons[buttonId].hotkey + '">' +
		'<label for="buttonOpenInNew" class="active">Replace current tab</label>' +
	'</div>'
	);
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
