'use strict';
addPanel({
  position: plugins[pluginName].settings[0].value || 0,
  htmlContent:
  `<li class="collection-item">
    <h5>
      <span id="time" class="right">00:00</span>
      <br>
      <span id="weekday" class="right">${new Date().toLocaleDateString('en-GB', {weekday: "long"})}</span>
      <br>
      <span id="date">${new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'})}</span>
    </h5>
  </li>`
});
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, 1000);
}, 0);
