'use strict';
const timeUpdateInterval = 1000;
const locales = {
  time: plugins[pluginName].settings[1].value || 'intl',
  date: plugins[pluginName].settings[2].value || 'intl',
  weekday: plugins[pluginName].settings[3].value || 'intl'
};

addPanel({
  position: plugins[pluginName].settings[0].value || 0,
  htmlContent:
  `<li class="collection-item">
    <h5>
      <span id="time" class="right">00:00</span>
      <br>
      <span id="weekday" class="right">${new Date().toLocaleDateString(locales.weekday, {weekday: 'long'})}</span>
      <br>
      <span id="date">${new Date().toLocaleDateString(locales.date, {month: 'long', day: '2-digit', year: 'numeric'})}</span>
    </h5>
  </li>`
});
setTimeout(function setTime() {
  byId('time').innerHTML = new Date().toLocaleTimeString(locales.time, {hour: '2-digit', minute: '2-digit', hour12: false});
  setTimeout(setTime, timeUpdateInterval);
}, 0);
