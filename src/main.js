'use strict';
document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
var pluginCss = byId('plugin-css');
var identity = 'Main page';

setTimeout(function () {
  new Button('assets/gmail.png', 'https://mail.google.com/mail/?authuser=0', 'Gmail');
  new Button('assets/youtube.png', 'https://www.youtube.com/?gl=RO&authuser=0', 'Youtube');
  new Button('assets/translate.png', 'https://translate.google.com/?hl=en&authuser=0', 'Translate');
  new Button('assets/reddit.png', 'https://www.reddit.com', 'Reddit');
  new Button('assets/github.png', 'https://github.com/', 'GitHub');
  new Button('assets/twitch.png', 'http://www.twitch.tv', 'Twitch');
  new Button('assets/extensions.png', 'chrome://extensions', 'Extensions');
  byId('date').innerHTML = new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'});
}, 0);
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, 1000);
}, 0);

storage.loadSettings(onSettings, function () {window.location.replace('/settings.html')});

function onSettings() {
  byId('title').innerHTML = settings['Main page title'].value;
  storage.loadPlugins(
  function () {
    for (var p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      try {eval(plugins[p].code)}
      catch(e) {console.error('Executing failed: ' + e.message)}
    }
  }, function () {console.log('No plugins executed.')});
}