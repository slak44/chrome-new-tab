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
  storage.store('settings');
  storage.store('plugins');
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

storage.load('settings', 
  settingsLoaded,
  function (e) {
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
  var sp = byId('settings-pane');
  for (var i in settings) {
     if (!settings[i].isVisible) continue;
     var input;
     switch (settings[i].type) {
       case 'checkbox': input = '<input id="'+settings[i].name+'" type="checkbox" value="'+settings[i].value+'">'; break;
       case 'number':   input = '<input id="'+settings[i].name+'" type="number"   value="'+settings[i].value+'">'; break;
       default:         input = '<input id="'+settings[i].name+'" type="text"     value="'+settings[i].value+'">';
     }
     sp.insertAdjacentHTML('beforeend',
     '<h1 class="global-text">' + settings[i].name +
     '<small>  ' + settings[i].desc + '</small>' +
     '</h1>' + input
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