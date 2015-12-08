'use strict';
setTimeout(loadSchemes, 0, () => activateScheme(colorScheme[0]));
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, 1000);
}, 0);

async.parallel([loadButtons, loadPlugins],
  loadPlugins);

document.onkeydown = function (e) {
  if (e.altKey) {
    for (let b in buttons) if (buttons[b].hotkey.charCodeAt() === e.keyCode) window.location.replace(buttons[b].href);
  }
};

function loadButtons(cb) {
  storage.load('buttons',
  function (error) {
    if (error) {
      createButton({text: 'Configure buttons here', href: '/secondary.html'});
    } else {
      let orderedButtons = [];
      for (let i in buttons) orderedButtons.push(buttons[i]);
      orderedButtons.sort((a, b) => Number(a.position) < Number(b.position) ? -1 : 1);
      orderedButtons.forEach(e => createButton({
          imagePath: e.imagePath,
          href: e.href,
          text: e.text,
          openInNew: e.openInNew
        }));
    }
    cb();
  });
  byId('date').innerHTML = new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'});
}

function loadPlugins() {
  document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style id="plugin-css"></style>');
  window.pluginCss = byId('plugin-css');
  storage.load('plugins',
  function (error) {
    for (let p in plugins) {
      console.log('Executing plugin: ' + plugins[p].name);
      /*jshint -W061*/
      try {if (plugins[p].main) eval('(' + plugins[p].main + ').apply(this, [plugins[\'' + p + '\']])');}
      catch(e) {console.error('Execution failed: ', e);}
    }
    if (error) console.log('No plugins executed.');
  });
}
