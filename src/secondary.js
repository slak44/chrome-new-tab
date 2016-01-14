'use strict';
let activeSchemeIndex = 0;

async.parallel([loadButtons, loadPlugins, loadSchemesAndUI], function (err) {
  if (err) throw err;
});

byId('floating-save-button').addEventListener('click', function (evt) {
  if (hasClass(byId('settings-tab'), 'focused')) {
    let currentPlugin = byQSelect('.plugin-container.focused');
    let cpId = currentPlugin.id.slice(0, -10);
    Array.prototype.forEach.apply(currentPlugin.children, [function (settingDiv, i, children) {
      if (i <= 1) return; // Ignore the title and the description
      plugins[cpId].settings[i - 2].value = settingDiv.children[0].value;
    }]);
		storage.store('plugins');
	} else if (hasClass(byId('buttons-tab'), 'focused')) {
		let id = byId('buttonText').getAttribute('data-button-id');
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
	    let data = JSON.parse(byId('insert-data').value);
	    if (data.pluginsData) {
        plugins = data.pluginsData;
        storage.store('plugins');
	    } else {} // TODO alert
      if (data.buttonsData) {
        buttons = data.buttonsData;
        storage.store('buttons');
      } else {} // TODO alert
	  }
	} else if (hasClass(byId('color-scheme-tab'), 'focused')) {
		// Switch the active one at the top
		let originalScheme = colorScheme[0];
		colorScheme[0] = colorScheme[activeSchemeIndex];
		colorScheme[activeSchemeIndex] = originalScheme;
		storage.store('colorScheme');
	}
});

function showTab(id) {
  return function (e) {
    e.preventDefault();
    toggleDiv(byQSelect('.data-tab.focused'), true);
    toggleDiv(id);
  };
}
byId('plugin-settings').addEventListener('click', showTab('settings-tab'));
byId('button-list').addEventListener('click', showTab('buttons-tab'));
byId('backup-and-restore').addEventListener('click', showTab('json-tab'));
byId('color-scheme').addEventListener('click', showTab('color-scheme-tab'));

byId('copy-data').addEventListener('click', function (event) {
	byId('temp-data').value = JSON.stringify({
    pluginsData: plugins,
    buttonsData: buttons
  });
	byId('temp-data').select();
  let status = document.execCommand('copy');
});

byId('add-plugin').addEventListener('click', function (e) {
  byId('file-input').addEventListener('change', (e) => addPlugins(e), false);
  byId('file-input').click();
});
byId('remove-plugin').addEventListener('click', function (e) {
  storage.remove('plugins', prompt('Plugin to remove:'));
  window.location.reload();
});

byId('add-scheme').addEventListener('click', function (e) {
  // TODO
});
byId('remove-scheme').addEventListener('click', function (e) {
	if (!confirm('Remove this scheme?')) return;
  colorScheme.splice(activeSchemeIndex, 1);
	let schemeElement = byQSelect('#color-scheme-list > a.active');
	schemeElement.parentNode.removeChild(schemeElement);
	byId('color-scheme-list').children[0].classList.add('active');
	storage.store('colorScheme');
});

byId('add-buttons').addEventListener('click', function (e) {
  e.preventDefault();
  let id = prompt('Input a unique identifier for the button:');
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
  byId('buttons-list').insertAdjacentHTML('beforeend',
    `<li id="${id}">
      <a href="#!">${id}</a>
    </li>`
  );
});
byId('remove-buttons').addEventListener('click', function (e) {
  e.preventDefault();
  if (!confirm('Are you sure you want to delete this button?')) return;
  let id = byId('buttonText').getAttribute('data-button-id');
  delete buttons[id];
  byId(id).parentNode.removeChild(byId(id));
  setCurrentButton(getFirstButton());
  storage.store('buttons');
});

function loadButtons(cb) {
  storage.load('buttons',
  function (error) {
    if (error || Object.keys(buttons).length === 0) {
      buttons = {};
      return;
    }
		addButtonConfig(Object.keys(buttons)[0]);
    let dropdown = byId('buttons-list');
    for (let id in buttons) {
			dropdown.insertAdjacentHTML('beforeend', 
        `<li id="${id}">
          <a href="#!">${id}</a>
        </li>`
      );
			byId(id).addEventListener('click', (function (id) {
				return function (evt) {
					setCurrentButton(buttons[id], id);
				};
			})(id)); // jshint ignore:line
		}
    cb();
  });
}

function setCurrentButton(buttonData, id) {
  if (byId('buttonText') === null) addButtonConfig(id);
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

function loadPlugins(cb) {
  storage.load('plugins', function (error) {
    if (!error) Object.keys(plugins).forEach(function (name, i, array) {
      let plugin = plugins[name];
      console.log('Executing plugin: ' + plugin.name);
      addPluginData(plugin, !byClass('plugin-container').length);
      /*jshint -W061 */
      try {
        if (plugin.secondary) eval('(' + plugin.secondary + ').apply(this, [])');
      } catch(e) {
        console.error('Execution failed: ' + e.message);
      }
    });
    cb();
  });
}

function addPluginData(plugin, focus) {
  byId('plugins-list').insertAdjacentHTML('beforeend',
    `<li id="${plugin.name}">
      <a href="#!">${plugin.name}</a>
    </li>`
  );
  byId('settings-tab').insertAdjacentHTML('beforeend',
    `<div id="${plugin.name}-container" class="plugin-container ${(focus ? 'focused' : 'unfocused')}"></div>`
  );
  let container = byId(plugin.name + '-container');
  container.insertAdjacentHTML('beforeend', 
    `<h5 class="plugin-title">${plugin.name}</h5>
    <p class="plugin-desc">
      ${plugin.desc}
      <br>
      ${plugin.version} by ${plugin.author}
    </p>`
  );
  if (plugin.settings) {
    plugin.settings.forEach(function (setting, i, settings) {
      if (!setting.isVisible) return;
      container.insertAdjacentHTML('beforeend',
      `<div class="input-field">
        <input id="${setting.name}" placeholder="${setting.desc}" type="${setting.type}" value="${setting.value}" class="">
        <label for="${setting.name}" class="active">${setting.name}</label>
      </div>`
      );
    });
  } else {
    container.insertAdjacentHTML('beforeend', '<p>There isn\'t anything here</p>');
  }
  byId(plugin.name).addEventListener('click', function (evt) {
    let container = byQSelect('.plugin-container.focused');
    toggleDiv(container, true);
    container.style.display = 'none';
    byId(plugin.name + '-container').style.display = 'block';
    toggleDiv(plugin.name + '-container');
  });
}

function loadSchemesAndUI() {
  loadSchemes(function () {
		activateScheme(colorScheme[0]);
		colorScheme.forEach(function (scheme, i, array) {
			let htmlContent = `<a href="#!" class="collection-item color">${scheme.name}<div class="row top-margin">`;
			Object.keys(scheme).forEach(function (color, i, array) {
			  if (color === 'name') return;
				if (color === 'isDark') {
					htmlContent += `<div style="background-color: ${scheme.isDark ? 'black' : 'white'};" class="col s1 color-sample"></div>`;
					return;
				}
				htmlContent += `<div style="background-color: ${scheme[color]};" class="col s1 color-sample"></div>`;
			});
			htmlContent += '</div></a>';
		  byId('color-scheme-list').insertAdjacentHTML('beforeend', htmlContent);
			Array.prototype.forEach.apply(byId('color-scheme-list').children, [function (schemeElement, i, arr) {
				if (i === 0) schemeElement.classList.add('active');
			  schemeElement.addEventListener('click', function (evt) {
					let actives = byQSelect('#color-scheme-list > a.active');
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
	`<div class="input-field">
		<input id="buttonText" type="text" class="" data-button-id="${buttonId}" value="${buttons[buttonId].text}">
		<label for="buttonText" class="active">Text</label>
	</div>
	<div class="input-field">
		<input id="buttonLink" type="url" class="validate" value="${buttons[buttonId].href}">
		<label for="buttonLink" class="active">Link</label>
	</div>
	<div class="input-field">
		<input id="buttonImage" type="url" class="validate" value="${buttons[buttonId].imagePath}">
		<label for="buttonImage" class="active">Image</label>
	</div>
	<div class="input-field">
		<input id="buttonPosition" type="number" class="" value="${buttons[buttonId].position}">
		<label for="buttonPosition" class="active">Order</label>
	</div>
	<div class="input-field">
		<input id="buttonHotkey" type="text" maxlength="1" class="" value="${buttons[buttonId].hotkey}">
		<label for="buttonHotkey" class="active">Hotkey</label>
	</div>
	<div class="input-field left align-left">
		<input id="buttonOpenInNew" type="checkbox" class="" checked="${buttons[buttonId].hotkey}">
		<label for="buttonOpenInNew" class="active">Replace current tab</label>
	</div>`
	);
}

function addPlugins(event) {
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.onloadend = (function (fileIn) {
    return function (e) {
      if (fileIn.type !== "application/javascript") {
        alert("Please choose a .js file.");
        return;
      }
      /*jshint -W061*/
      let plugin = eval(e.target.result);
      if (plugin.init) plugin.init();
      // Serialize functions, if they exist
      if (typeof plugin.init === 'function') plugin.init = plugin.init.toString();
      if (typeof plugin.main === 'function') plugin.main = plugin.main.toString();
      if (typeof plugin.secondary === 'function') plugin.secondary = plugin.secondary.toString();
      // If settings already exist and the new plugin has things to set, use existing data
      if (plugins[plugin.name] && plugins[plugin.name].settings && plugin.settings) plugin.settings = Object.assign({}, plugins.settings, plugins[plugin.name].settings);
      storage.add('plugins', plugin, () => window.location.reload());
    };
  })(file);
  reader.readAsText(file);
}
