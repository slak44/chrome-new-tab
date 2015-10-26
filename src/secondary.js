'use strict';
var activeSchemeIndex = 0;

async.parallel([loadButtons, loadSettings, loadSchemesAndUI, configureButtonPane], function (err) {
  if (err) throw err;
});

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
	  if (byId('insert-data').value !== '') {
	    var data = JSON.parse(byId('insert-data').value);
	    if (data.settingsData !== undefined && data.buttonsData !== undefined) {
	      settings = data.settingsData;
	      buttons = data.buttonsData;
	    }
	  }
		storage.store('settings');
		storage.store('buttons');
	} else if (hasClass(byId('color-scheme-tab'), 'focused')) {
		// Switch the active one at the top
		var originalScheme = colorScheme[0];
		colorScheme[0] = colorScheme[activeSchemeIndex];
		colorScheme[activeSchemeIndex] = originalScheme;
		storage.store('colorScheme');
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
byId('color-scheme').addEventListener('click', showTab('color-scheme-tab'));

byId('copy-data').addEventListener('click', function (event) {
	byId('temp-data').value = JSON.stringify({
    settingsData: settings,
    buttonsData: buttons
  });
	byId('temp-data').select();
  var status = document.execCommand('copy');
	console.log(status);
});

byId('add-plugin').addEventListener('click', function (e) {
  byId('file-input').addEventListener('change', function (e) {addPlugins(e, true);}, false);
  byId('file-input').click();
});
byId('remove-plugin').addEventListener('click', function (e) {
  storage.remove('plugins', prompt('Plugin to remove:'));
});

byId('add-scheme').addEventListener('click', function (e) {
  // TODO
});
byId('remove-scheme').addEventListener('click', function (e) {
	if (!confirm('Remove this scheme?')) return;
  colorScheme.splice(activeSchemeIndex, 1);
	var schemeElement = document.querySelector('#color-scheme-list > a.active');
	schemeElement.parentNode.removeChild(schemeElement);
	byId('color-scheme-list').children[0].classList.add('active');
	storage.store('colorScheme');
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

function loadSchemesAndUI() {
  loadSchemes(function () {
		activateScheme(colorScheme[0]);
		colorScheme.forEach(function (scheme, i, array) {
			var htmlContent = '<a href="#!" class="collection-item color">' + scheme.name + '<div class="row top-margin">';
			Object.keys(scheme).forEach(function (color, i, array) {
			  if (color === 'name') return;
				if (color === 'isDark') {
					htmlContent += '<div style="background-color: ' + (scheme.isDark ? 'black' : 'white') + ';" class="col s1 color-sample"></div>';
					return;
				}
				htmlContent += '<div style="background-color: ' + scheme[color] + ';" class="col s1 color-sample"></div>';
			});
			htmlContent += '</div></a>';
		  byId('color-scheme-list').insertAdjacentHTML('beforeend', htmlContent);
			Array.prototype.forEach.apply(byId('color-scheme-list').children, [function (schemeElement, i, arr) {
				if (i === 0) schemeElement.classList.add('active');
			  schemeElement.addEventListener('click', function (evt) {
					var actives = document.querySelector('#color-scheme-list > a.active');
					if (actives) actives.classList.remove('active');
			    schemeElement.classList.add('active');
					activeSchemeIndex = i;
			  });
			}]);
		});
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
