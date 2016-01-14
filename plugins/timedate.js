'use strict';
let plugin = {
  name: 'Date and Time',
  desc: 'Displays time and date',
  author: 'Slak44',
  version: '1.0.0',
  main: function (plugin) {
    byId('data-collection').insertAdjacentHTML('beforeend',
      `<li class="collection-item">
        <h5>
      		<span id="time" class="right">00:00</span>
      		<br>
      		<span id="date">${new Date().toLocaleDateString('en-GB', {month: 'long', day: '2-digit', year: 'numeric'})}</span>
      	</h5>
      </li>`);
    setTimeout(function setTime() {
      byId('time').innerHTML = new Date().toLocaleTimeString('intl', {hour: '2-digit', minute: '2-digit', hour12: false});
      setTimeout(setTime, 1000);
    }, 0);
  }
};
/*jshint -W030 */
plugin;
