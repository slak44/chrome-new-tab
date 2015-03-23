'use strict';
var startOfCircle = ($(window).width()-800)/2;
var buttons = {
  saveOptions:  new Button(undefined, undefined, "Save Options", true),
  addPlugin:    new Button(undefined, undefined, "Add Plugin", true),
  removePlugin: new Button(undefined, undefined, "Remove Plugin", true)
};

var list = byId("pluginList");
list.style.width = (startOfCircle-40/*Padding*/)+"px";
byId("circle").style.left = startOfCircle+"px";

addButtons();
populatePluginList();
loadSettings(function() {}, function() {});

buttons.addPlugin.setOnClick(function() {
  byId("fileInput").addEventListener('change', addPlugin, false);
  $("#fileInput").click();
});
buttons.removePlugin.setOnClick(function() {
  removePlugin(prompt("Enter the name of the plugin to remove:"));
});
buttons.saveOptions.setOnClick(function() {
});

function storePlugins() {
  chrome.storage.local.set(
    {"storedPlugins": plugins},
    function() {}
  );
}

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
  if ($.type(pluginName) != "string") new Error("Plugin name must be a string.");
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
