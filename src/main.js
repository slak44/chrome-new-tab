'use strict';
document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
var pluginCss = byId('plugin-css');
var identity = 'Main page';

setTimeout(function () {
  storage.load('buttons',
  function () {
    var orderedButtons = [];
    for (var i in buttons) orderedButtons.push(buttons[i]);
    orderedButtons.sort(function (a, b) {
      if (Number(a.position) < Number(b.position)) return -1;
      else return 1;
    });
    for (var i = 0; i < orderedButtons.length; i++) new Button(orderedButtons[i].imagePath, orderedButtons[i].href, orderedButtons[i].text);
  }, function () {
    new Button(undefined, '/settings.html', 'Configure buttons here');
  });
  byId('date').innerHTML = new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'});
}, 0);
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, 1000);
}, 0);

storage.load('settings', onSettings, function () {window.location.replace('/settings.html')});

function onSettings() {
  // If a visible value is empty, it fails immediately
  for (var e in settings) if (settings[e].isVisible && settings[e].value === undefined) window.location.replace('/settings.html');
  byId('title').innerHTML = settings['Main page title'].value;
  storage.load('plugins',
  function () {
    for (var p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      try {eval(plugins[p].code)}
      catch(e) {console.error('Executing failed: ' + e.message)}
    }
  }, function () {console.log('No plugins executed.')});
}