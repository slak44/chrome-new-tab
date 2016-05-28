'use strict';
let util = new PluginUtil(pluginName);
addPanel({
  position: util.getSetting('Position') || 0,
  htmlContent:
  `<li id="title" class="collection-item bold">
    <h1>${util.getSetting('Title Text')}</h1>
  </li>`
});
