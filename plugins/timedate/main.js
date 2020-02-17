'use strict';
const timeUpdateInterval = 1000; // 1 second

const html = $.parseHTML(
  `<h5>
    <span id="time" class="right">00:00</span>
    <br>
    <span id="weekday" class="right"></span>
    <br>
    <span id="date" class="right"></span>
  </h5>`
);
api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));

function setTime() {
  const d = new Date();
  $('#time').text(d.toLocaleTimeString(api.setting('Time Locale'), {hour: '2-digit', minute: '2-digit', hour12: false}));
  $('#weekday').text(d.toLocaleDateString(api.setting('Weekday Locale'), {weekday: 'long'}));
  $('#date').text(d.toLocaleDateString(api.setting('Date Locale'), {month: 'long', day: '2-digit', year: 'numeric'}));
}

setTime();
setInterval(setTime, timeUpdateInterval);
