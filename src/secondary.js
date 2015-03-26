'use strict';
var identity = "Options page";
var startOfCircle = ($(window).width()-800)/2;
var buttons = {
  addPlugin:    new Button(undefined, undefined, "Add Plugin", true),
  removePlugin: new Button(undefined, undefined, "Remove Plugin", true)
};

var list = byId("pluginList");
list.style.width = (startOfCircle-40/*Padding*/)+"px";
byId("circle").style.left = startOfCircle+"px";
byId("titleText").style.cssText += "top: 100px; left:"+startOfCircle+"; width: 800px; text-align: center;";

loadSettings(
  settingsLoaded,
  function() {
    settingsLoaded();
    byId("titleText").innerHTML = "Configure settings to use new tab";
  }
);

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
  //Closure for file
  reader.onloadend = (function(fileIn) {
    return function(e) {
      if (fileIn.type !== "application/javascript") {
        alert("Please choose a .js file.");
        return;
      }
      if (plugins === undefined) plugins = [];
      //Add it to the display, to the array, and to the storage
      plugins.push(new Plugin(e.target.result, fileIn.name));
      appendHTML(list, plugins[plugins.length-1].serializableNode);
      storePlugins();
      byId("titleText").innerHTML = "Refresh the page to see the plugin's settings";
    }
  })(file);
  reader.readAsText(file);
}

function removePlugin(pluginName) {
  checkType(pluginName, "string");
  for (var i = 0; i < plugins.length; i++) {
    if (plugins[i].title == pluginName) {
      //Remove it from the display, from the array, and from storage
      list.removeChild(byId(plugins[i].title)); //title === child's id
      plugins.splice(i, 1);
      storePlugins();
    }
  }
}

function addButtons() {
  for (var b in settings) if (settings[b].isVisible) buttons[b] = settings[b].button;
  var i = 0;
  for (var key in buttons) {
    document.body.appendChild(buttons[key].aHref);
    buttons[key].aHref.style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
    i++;
  }
}

function settingsLoaded() {
  new Setting("Please input a title:", "Title");
  new Setting("Please input your reddit username:", "Reddit username");
  loadPlugins(function() {
    for (var i = 0; i < plugins.length; i++) {
      appendHTML(list, plugins[i].serializableNode);
      console.log("Adding plugin settings: "+plugins[i].title);
      eval(plugins[i].code);
    }
    addButtons();
  }, addButtons);
}
