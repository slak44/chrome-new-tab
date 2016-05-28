'use strict';
const util = new PluginUtil(pluginName);
const timeUpdateInterval = 1000;
const locales = {
  time: util.getSetting('Time Locale') || 'intl',
  date: util.getSetting('Date Locale') || 'intl',
  weekday: util.getSetting('Weekday Locale') || 'intl'
};

addPanel({
  position: util.getSetting('Position') || 0,
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
