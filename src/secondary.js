'use strict';
var identity = 'Options page';
var buttons = [
  new Button(undefined, undefined, 'Add Plugin'),
  new Button(undefined, undefined, 'Remove Plugin'),
  new Button(undefined, undefined, 'Save settings')
];

buttons[0].aHref.addEventListener('click', function (e) {
  e.preventDefault();
  byId('file-input').addEventListener('change', addPlugin, false);
  byId('file-input').click();
});
buttons[1].aHref.addEventListener('click', function (e) {
  e.preventDefault();
  
});
buttons[2].aHref.addEventListener('click', function (e) {
  e.preventDefault();
  var keys = Object.keys(settings);
  for (var i = 0; i < keys.length; i++) {
    if (!settings[keys[i]].isVisible) continue;
    var input = byId(keys[i]);
    if (input === undefined || input === null) continue;
    settings[keys[i]].value = input.value;
  }
  storage.storeSettings();
});

for (var i = 0; i < buttons.length; i++) buttons[i].aHref.style.left = i * (200/*Button width*/ + 10/*Space between btns*/ + 30/*Anim size*/) + 'px';

storage.loadSettings(
  settingsLoaded,
  function () {
    storage.addSetting('Main page title', 'Title displayed in the center of the main page.', 'string', true);
    settingsLoaded();
  }
);

function settingsLoaded() {
  storage.loadPlugins(function() {
    for (var p in plugins) {
      console.log('Adding plugin settings: ' + plugins[p].name);
      eval(plugins[p].code);
    }
    showSettings();
  }, showSettings);
}

function showSettings() {
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

function addPlugin(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onloadend = (function (fileIn) {
    return function (e) {
      if (fileIn.type !== "application/javascript") {
        alert("Please choose a .js file.");
        return;
      }
      storage.addPlugin(prompt('Plugin name:'), prompt('Plugin description:'), e.target.result);
    }
  })(file);
  reader.readAsText(file);
}