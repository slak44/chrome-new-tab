'use strict';
var startOfCircle = ($(window).width()-800)/2;
var buttons = {
  addPlugin:    new Button(undefined, undefined, "Add Plugin", true),
  removePlugin: new Button(undefined, undefined, "Remove Plugin", true)
};

populatePluginList();
loadSettings(function() {}, function() {});

chrome.storage.local.get("storedSettingsToLoad", function(data) {
  var sets = data.storedSettingsToLoad;
  for (var set in sets)
    buttons[set] = new Setting(sets[set].key, sets[set].displayText, sets[set].buttonText).getDisplay();
  addButtons();
});

var list = byId("pluginList");
list.style.width = (startOfCircle-40/*Padding*/)+"px";
byId("circle").style.left = startOfCircle+"px";
byId("titleText").style.cssText += "top: 100px; left:"+startOfCircle+"; width: 800px; text-align: center;";
if (settings == undefined) byId("titleText").innerHTML = "Configure settings to use new tab";

buttons.addPlugin.setOnClick(function() {
  byId("fileInput").addEventListener('change', addPlugin, false);
  $("#fileInput").click();
});
buttons.removePlugin.setOnClick(function() {
  removePlugin(prompt("Enter the name of the plugin to remove:"));
});

function addPlugin(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onloadend = (function(fileIn) {
    return function(e) {
      if (fileIn.type !== "application/javascript") {
        alert("Please choose a .js file.");
        return;
      }
      plugins.push(new Plugin(e.target.result, fileIn.name));
      list.appendChild(plugins[plugins.length-1].getDisplay());
      storePlugins();
    }
  })(file);
  reader.readAsText(file);
}

function removePlugin(pluginName) {
  checkType(pluginName, "string");
  for (var i = 0; i < plugins.length; i++) {
    if (plugins[i].title == pluginName) {
      list.removeChild(plugins[i].display);
      plugins.splice(i, 1);
      storePlugins();
    }
  }
}

function addButtons() {
  var i = 0;
  for (var key in buttons) {
    document.body.appendChild(buttons[key].aHref);
    buttons[key].aHref.style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
    i++;
  }
}

function populatePluginList() {
  loadPlugins(function() {
    for (var i = 0; i < plugins.length; i++) list.appendChild(plugins[i].getDisplay());
  });
}
