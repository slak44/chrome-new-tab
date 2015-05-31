'use strict';
var identity = 'Options page';
var buttons = [
  new Button(undefined, undefined, 'Add Plugin'),
  new Button(undefined, undefined, 'Remove Plugin'),
  new Button(undefined, undefined, 'Update Plugin'),
  new Button(undefined, undefined, 'Save settings')
];

buttons[0].anchor.addEventListener('click', function (e) {
  e.preventDefault();
  byId('file-input').addEventListener('change', addPlugin, false);
  byId('file-input').click();
});
buttons[1].anchor.addEventListener('click', function (e) {
  e.preventDefault();
  storage.removePlugin(prompt('Plugin to remove:'));
});
buttons[2].anchor.addEventListener('click', function (e) {
  e.preventDefault();
  byId('file-input').addEventListener('change', function (e) {addPlugin(e, true)}, false);
  byId('file-input').click();
})
buttons[3].anchor.addEventListener('click', function (e) {
  e.preventDefault();
  var keys = Object.keys(settings);
  for (var i = 0; i < keys.length; i++) {
    if (!settings[keys[i]].isVisible) continue;
    var input = byId(keys[i]);
    if (input === undefined || input === null) continue;
    settings[keys[i]].value = input.value;
  }
  storage.storeSettings();
  storage.storePlugins();
});
storage.loadSettings(
  settingsLoaded,
  function () {
    storage.addSetting({
      name: 'Main page title',
      desc: 'Title displayed in the center of the main page.',
      type: 'string',
      isVisible: true
    }, {});
    settingsLoaded();
  }
);

function settingsLoaded() {
  storage.loadPlugins(function () {
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

function addPlugin(event, allowUpdate) {
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
        storage.addPlugin({
            name: name,
            desc: plugins[name].desc,
            code: e.target.result
          }, {update: allowUpdate});
      } else storage.addPlugin({
          name: prompt('Plugin name:'),
          desc: prompt('Plugin description:'),
          code: e.target.result
        }, {update: false});
    }
  })(file);
  reader.readAsText(file);
}