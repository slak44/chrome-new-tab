'use strict';
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, 1000);
}, 0);

async.parallel([loadButtons, loadSettings],
  loadPlugins);

function loadButtons(cb) {
  storage.load('buttons',
  function () {
    var orderedButtons = [];
    for (var i in buttons) orderedButtons.push(buttons[i]);
    orderedButtons.sort(function (a, b) {
      if (Number(a.position) < Number(b.position)) return -1;
      else return 1;
    });
    for (var i = 0; i < orderedButtons.length; i++) new Button(orderedButtons[i].imagePath, orderedButtons[i].href, orderedButtons[i].text);
    cb();
  }, function () {
    new Button(undefined, '/secondary.html', 'Configure buttons here');
    cb();
  });
  byId('date').innerHTML = new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'});
}

function loadSettings(cb) {
  storage.load('settings', cb, function () {window.location.replace('/secondary.html')});
}

function loadPlugins() {
  document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
  window.pluginCss = byId('plugin-css');
  // If a visible value is empty, it fails immediately
  for (var e in settings) if (settings[e].isVisible && settings[e].value === undefined) window.location.replace('/secondary.html');
  byId('title').innerHTML = settings['Main page title'].value;
  storage.load('plugins',
  function () {
    for (var p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      try {if (plugins[p].main) eval('(' + plugins[p].main + ').apply(this, [])')}
      catch(e) {console.error('Execution failed: ' + e.message)}
    }
  }, function () {console.log('No plugins executed.')});
}