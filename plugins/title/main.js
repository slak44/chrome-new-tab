'use strict';
addPanel({
  position: plugins[pluginName].settings[1].value || 0,
  htmlContent:
  `<li id="title" class="collection-item bold">
    <h1>${plugins[pluginName].settings[0].value}</h1>
  </li>`
});
