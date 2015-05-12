'use strict';
var identity = "Options page";
console.log(byId('default-pane'));
var buttons = [
  new Button(undefined, undefined, "Add Plugin"),
  new Button(undefined, undefined, "Remove Plugin")
];

storage.loadSettings(
  settingsLoaded,
  function () {
    byId("titleText").innerHTML = "Configure settings to use new tab";
    settings.push({
      name: 'Main page title',
      desc: 'Title displayed in the center of the main page.',
      type: 'string',
      isVisible: true
    });
    storage.storeSettings();
    settingsLoaded();
  }
);

// function addPlugin(event) {
//   var file = event.target.files[0];
//   var reader = new FileReader();
//   //Closure for file
//   reader.onloadend = (function(fileIn) {
//     return function(e) {
//       if (fileIn.type !== "application/javascript") {
//         alert("Please choose a .js file.");
//         return;
//       }
//       if (plugins === undefined) plugins = [];
//       //Add it to the display, to the array, and to the storage
//       plugins.push(new Plugin(e.target.result, fileIn.name));
//       appendHTML(list, plugins[plugins.length-1].serializableNode);
//       storage.storePlugins();
//       byId("titleText").innerHTML = "Refresh the page to see the plugin's settings";
//     }
//   })(file);
//   reader.readAsText(file);
// }
// 
// function removePlugin(pluginName) {
//   for (var i = 0; i < plugins.length; i++) {
//     if (plugins[i].title == pluginName) {
//       //Remove its settings, remove it from the display, from the array, and from plugin storage
//       for (var a in settings) if (settings[a].src === plugins[i].title) delete settings[a];
//       list.removeChild(byId(plugins[i].title)); //title === child's id
//       plugins.splice(i, 1);
//       storage.storePlugins();
//       storage.storeSettings();
//     }
//   }
// }

// function addButtons() {
  // for (var b in settings) if (settings[b].isVisible) buttons[b] = settings[b].button;
  // var i = 0;
  // for (var key in buttons) {
  //   // appendHTML(document.body, buttons[key].serializableNode);
  //   byId(key).style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
  //   if (key in settings) $(byId(key)).click(function() {
  //     settings[this.id].value = prompt(settings[this.id].promptMessage);
  //     storage.storeSettings();
  //   });
  //   i++;
  // }
  // $(byId("Add Plugin")).click(function() {
  //   byId("fileInput").addEventListener('change', addPlugin, false);
  //   $("#fileInput").click();
  // });
  // $(byId("Remove Plugin")).click(function() {
  //   removePlugin(prompt("Enter the name of the plugin to remove:"));
  // });
// }

function settingsLoaded() {
  // new Setting("Please input a title:", "local", "Title");
  storage.storage.loadPlugins(function() {
    // for (var i = 0; i < plugins.length; i++) {
    //   appendHTML(list, plugins[i].serializableNode);
    //   console.log("Adding plugin settings: "+plugins[i].title);
    //   eval(plugins[i].code);
    // }
    // addButtons();
  }/*, addButtons*/);
}
