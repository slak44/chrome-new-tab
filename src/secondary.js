'use strict';
byId("circle").style.left = ($(window).width()-800)/2;
var saveOptions = new Button(undefined, undefined, "Save Options", true);
var addPlugin = new Button(undefined, undefined, "Add Plugin", true);
addButtons();

addPlugin.setOnClick(function() {
  byId("fileInput").addEventListener('change', handlePlugin, false);
  $("#fileInput").click();
});

function handlePlugin(event) {
  var file = event.target.files;
  var reader = new FileReader();
  var text = reader.readAsText(file[0]);
  reader.onLoad = function(file) {
    console.log(file);
  }
}

function addButtons() {
  byId("body").appendChild(saveOptions.aHref);
  byId("body").appendChild(addPlugin.aHref);
  var buttons = document.getElementsByClassName("button");
  for (var i = 0; i < buttons.length; i++) buttons[i].style.top = i * (50/*Button height*/ + 10/*Space between btns*/) + "px";
}
