'use strict';
var plugins = [];
var settings = {};

/*
PROTOTYPES
*/

/*Plugin prototype.*/
function Plugin(code, title) {
  this.code = code;
  this.title = title;

  var element = document.createElement("li");
  var text = document.createElement("pre");
  $(text).toggleClass("globalText");
  text.innerHTML = title;
  element.id = title;
  element.appendChild(text);
  this.display = element;
  this.serializableNode = this.display.outerHTML;
}

/*Button prototype.*/
function Button(imagePath, href, text, parent) {
  if (parent === undefined) parent = byId('default-pane');
  parent.insertAdjacentHTML('beforeend',
  '<a href="'+href+'" class="button">\
    <img src="'+imagePath+'" class="button-img"></img>\
    <pre class="button-text">'+text+'</pre>\
  </a>');
  this.aHref = parent.children[parent.children.length - 1];
}

/*Setting prototype.*/
function Setting(promptMessage, src, buttonText, isVisible) {
  this.isVisible = (isVisible === undefined)? true : isVisible;
  this.button = new Button(undefined, undefined, buttonText, true);
  this.promptMessage = promptMessage;
  this.src = src;
  $(this.button).click(function() {
    settings[this.id].value = prompt(promptMessage);
    storeSettings();
  });
  try {if (settings[buttonText].value === undefined) settings[buttonText] = this;}
  catch (err) {settings[buttonText] = this;}
  storeSettings();
}

/*
DOM UTILS
*/

/*Wrapper.*/
function byId(id) {
  return document.getElementById(id);
}

function showDiv(id) {
  $('#' + id).toggleClass('unfocused').toggleClass('focused');
}

/*
STORAGE OPS
*/

function loadPlugins(onLoad, onError) {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedPlugins", function(data) {
      plugins = data.storedPlugins;
      if (data.storedPlugins == undefined) reject("No plugins found.");
      else resolve("Done fetching plugins.");
    });
  }).then(
    function(res) {console.log(res);onLoad();},
    function(err) {console.log(err);onError();}
  );
}

function loadSettings(onLoad, onError) {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedSettings", function(data) {
      settings = data.storedSettings;
      //Make sure there's something there
      if (settings === undefined || settings === null) {
        reject("Failed to load settings.");
        return;
      }
      //Make sure the values aren't empty
      //If a visible value is empty, it fails immediately
      if (Object.keys(settings).length !== 0)
        for (var key in Object.keys(settings)) {
          if (Object.keys(settings)[key].isVisible == true &&
                Object.keys(settings)[key] === undefined) {
            reject("Failed to load settings.");
            return;
          }
        }
      resolve("Done fetching settings.");
    });
  }).then(
    function(res) {
      console.log(res);
      onLoad();
    },
    function(err) {
      console.log(err);
      settings = {};
      onError();
    }
  );
}

function storeSettings() {
  chrome.storage.local.set({"storedSettings": settings}, undefined);
}

function storePlugins() {
  chrome.storage.local.set({"storedPlugins": plugins}, undefined);
}

/*Clear the storage.*/
function clearStorage() {
  settings = {};
  plugins = [];
  chrome.storage.local.clear();
}
function clearSettings() {
  chrome.storage.local.set({"storedSettings": {}}, undefined);
}
function clearPlugins() {
  chrome.storage.local.set({"storedPlugins": []}, undefined);
}

/*
GENERAL UTILS
*/

/*Performs a GET request.*/
function get(url, res) {
  new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) resolve(req.response);
      else reject(Error(req.statusText));
    };
    req.send();
  }).then(res, function(err) {console.log(err)});
}

/*Queues async tasks one after another. Each function must have the first parameter a callback, that is called at the end of the async job.*/
function queue(funcs, scope) {
  (function next() {
    if (funcs.length > 0) funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
  })();
};
