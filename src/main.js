'use strict';
var identity = "Main page"
var settingsConfig = [];
var mainButtons = {
  "Gmail":      new Button("assets/gmail.png", "https://mail.google.com/mail/?authuser=0", "Gmail"),
  "Youtube":    new Button("assets/youtube.png", "https://www.youtube.com/?gl=RO&authuser=0", "Youtube"),
  "Translate":  new Button("assets/translate.png", "https://translate.google.com/?hl=en&authuser=0", "Translate"),
  "Reddit":     new Button("assets/reddit.png", "https://www.reddit.com", "Reddit"),
  "GitHub":     new Button("assets/github.png", "https://github.com/", "GitHub"),
  "LoLNexus":   new Button("assets/lolnexus.png", "http://www.lolnexus.com/EUNE/search?name=slak44&region=EUNE", "LoLNexus"),
  "Extensions": new Button("assets/extensions.png", undefined, "Extensions")
};

loadPlugins(executePluginsOnLoad);
loadSettings(settingsPresent, settingsAbsent);

function executePluginsOnLoad() {
  for (var i = 0; i < plugins.length; i++) {
    console.log("Executing plugin: "+plugins[i].title);
    eval(plugins[i].code);
  }
}

/*Settings not present; go to settings tab to configure.*/
function settingsAbsent() {
  chrome.tabs.create({url: "chrome-extension://"+chrome.runtime.id+"/settings.html"});
  window.close();
}

/*Settings present; edit the dom and queue the plugin functions.*/
function settingsPresent() {
  manipulateDOM();
  queue(settingsConfig, window);
}

function manipulateDOM() {
  var i = 0;
  for (var key in mainButtons) {
    if (mainButtons.hasOwnProperty(key)) byId("defaultPane").appendChild(mainButtons[key].aHref);
    mainButtons[key].aHref.style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
    i++;
  }
  mainButtons["Extensions"].setOnClick(function() {chrome.tabs.create({url:'chrome://extensions'})});

  byId("dataPane").style.left = ($(window).width()/2) - 400 + "px";
  addData("name", settings["Title"].value, "p", "100px", "50px");
  addData("time", "00:00", "p", "100px", "150px");
  addData("date", "01 January 1970", "p", "50px", "300px");
  setDate();
  setTime();
}

function addData(id, content, tag, fontSize, topPos) {
  var elem =
  '<'+tag+' id='+id+' class="blockabsolute globalText" '+
  'style="text-align: center; width: 800px; '+
  'font-size:'+fontSize+'; top:'+topPos+';">'+content+'</'+tag+'>';
  appendHTML(byId("dataPane"), elem);
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
