'use strict';
loadPlugins(executePluginsOnLoad);
loadSettings(settingsPresent, settingsAbsent);

function executeSettingsOnLoad() {
  for (var i = 0; i < onSettingsLoad.length; i++) onSettingsLoad[i]();
}

function executePluginsOnLoad() {
  for (var i = 0; i < plugins.length; i++) plugins[i].execute();
}

/*Settings not present; prompt for data, store data, load the data.*/
function settingsAbsent() {
  settings.name = prompt("Please input a title:");
  settings.redditUser = prompt("Please input your reddit username:");
  settingsConfig.push(function(callback) {chrome.storage.local.set({"storedSettings": settings}, callback);});
  settingsConfig.push(executeSettingsOnLoad);
  queue(settingsConfig, window);
  manipulateDOM();
}

/*Settings present; load the data.*/
function settingsPresent() {
  setTimeout(manipulateDOM, 0);
  executeSettingsOnLoad();
}

function manipulateDOM() {
  byId("dataPane").style.left = ($(window).width()/2) - 400 + "px";
  byId("dataPane").style.top = "0px";
  byId("persistentIsOnline").style.right = "0px";

  var i = 0;
  for (var key in mainButtons) {
    if (mainButtons.hasOwnProperty(key)) byId("defaultPane").appendChild(mainButtons[key].aHref);
    mainButtons[key].aHref.style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
    i++;
  }
  mainButtons["Extensions"].setOnClick(function() {chrome.tabs.create({url:'chrome://extensions'})});

  addData("name", settings.name, "p");
  addData("time", "00:00", "p");
  addData("date", "01 January 1970", "p");
  addData("redditkarma", "", "pre");
  setTimeout(updateRedditKarma, 0);
  setDate();
  setTime();
}

function addData(id, content, element) {
  var e = document.createElement(element);
  e.innerHTML = content;
  e.id = id;
  e.style.textAlign = "center";
  e.style.width = "800px";
  $(e).toggleClass("blockabsolute globalText");
  byId("dataPane").appendChild(e);
}

function setTime() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if (m < 10) m = "0" + m;
  if (h < 10) h = "0" + h;
  var time = h + ":" + m;
  byId("time").innerHTML = time;
  setTimeout(setTime, 5000);
}
function setDate() {
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth();
  var year = d.getFullYear();
  if (day < 10) day = "0" + day;
  var date = day + " " + getMonthName(month) + " " + year;
  byId("date").innerHTML = date;
}

function getMonthName(monthNumeral) {
  switch (monthNumeral) {
  case  0: return "January";
  case  1: return "February";
  case  2: return "March";
  case  3: return "April";
  case  4: return "May";
  case  5: return "June";
  case  6: return "July";
  case  7: return "August";
  case  8: return "September";
  case  9: return "October";
  case 10: return "November";
  case 11: return "December";
  default: return "What did you do with this method?"
  }
}

/*
Updates the on-screen karma every 7.5s by requesting reddit data.
Connection indicator relies on this method.
*/
function updateRedditKarma() {
  $.getJSON('https://www.reddit.com/user/'+settings.redditUser+'/about.json?',
    function(data){
      byId('redditkarma').innerHTML =
      "Comment karma: "+data.data.comment_karma+"\n"+
      "Link karma: "+data.data.link_karma;
      byId("persistentIsOnline").src = "assets/empty30x30.png";
  }).error(function() {byId("persistentIsOnline").src = "assets/noconnection.png"});
  setTimeout(updateRedditKarma, 7500);
}
