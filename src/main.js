'use strict';
var identity = "Main page";
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

loadPlugins(executePluginsOnLoad, function() {});
loadSettings(settingsPresent, settingsAbsent);

function executePluginsOnLoad() {
  for (var i = 0; i < plugins.length; i++) {
    console.log("Executing plugin: "+plugins[i].title);
    eval(plugins[i].code);
  }
}

/*Settings not present; go to settings tab to configure.*/
function settingsAbsent() {
  chrome.tabs.create({url: "chrome-extension://" + chrome.runtime.id + "/settings.html"});
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
    mainButtons[key].aHref.style.top = i * (75/*Button height*/ + 10/*Space between btns*/) + "px";
    i++;
  }
  mainButtons["Extensions"].addEventListener('click', function (e) {
    chrome.tabs.create({url: 'chrome://extensions'});
    window.close();
  });
  byId('title').innerHTML = settings["Title"].value;
  byId("date").innerHTML = new Date().toLocaleString('intl', {year:'numeric', month: 'long', day:'2-digit'});
  setTime();
  function setTime() {
    byId("time").innerHTML = new Date().toLocaleTimeString().slice(0, -3);
    setTimeout(setTime, 1000);
  }
}
