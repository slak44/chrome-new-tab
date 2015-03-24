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
  this.execute = function() {
    console.log("Executing plugin: "+title);
    eval(code);
  }
  this.getDisplay = function() {
    var element = document.createElement("li");
    var text = document.createElement("pre");
    $(text).toggleClass("globalText");
    text.innerHTML = title;
    element.appendChild(text);
    this.display = element;
    return element;
  }
}

/*Button prototype.*/
function Button(imagePath, href, preText, textOnly) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  //If there is no href, make sure the cursor looks as if there was
  if (href !== undefined) link.href = href;
  else link.style.cursor = "pointer";
  link.id = preText;
  $(link).toggleClass("blockabsolute button");
  $(text).toggleClass("globalText buttonText");
  text.innerHTML = preText;
  if (textOnly) {
    link.style.backgroundImage = "url('assets/button.png')";
    text.style.marginLeft = "0px";
    text.style.textAlign = "center";
  } else link.style.backgroundImage = "url('"+imagePath+"'), url('assets/button.png')";

  this.aHref = link;
  this.preText = text;

  this.setImage = function(path) {
    link.style.backgroundImage = "url('"+path+"'), url('assets/button.png')";
  }
  this.setText = function(text) {
    this.preText.innerHTML = text;
  }
  this.setOnClick = function(what) {
    $(this.aHref).click(what);
  }
}

/*
DOM UTILS
*/

/*Wrapper.*/
function byId(id) {
  return document.getElementById(id);
}

/*Move divs around.*/
function moveDiv(side/*Left=true or right=false*/, id) {
  if (side) {
    byId(id).style.left = "0px";
    byId(id).className = "";
    $(byId(id)).toggleClass("goLeft");
  } else {
    byId(id).style.left = -$(window).width() + "px";
    byId(id).className = "";
    $(byId(id)).toggleClass("goRight");
  }
}

function addCSS(css) {
  var newCss = document.createElement('style');
  newCss.type = 'text/css';
  newCss.appendChild(document.createTextNode(css));
  document.getElementsByTagName("head")[0].appendChild(newCss);
}

/*
STORAGE OPS
*/

function loadPlugins(onLoad) {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedPlugins", function(data){
      for (var i = 0; i < data.storedPlugins.length; i++)
        data.storedPlugins[i] = new Plugin(data.storedPlugins[i].code, data.storedPlugins[i].title);
      plugins = data.storedPlugins;
      if (data.storedPlugins == undefined) reject("No plugins found.");
      else resolve("Done fetching plugins.");
    });
  }).then(
    function(res) {console.log(res);onLoad();},
    function(err) {console.log(err)}
  );
}

function loadSettings(onLoad, onError) {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedSettings", function(data){
      settings = data.storedSettings;
      if (data.storedSettings == undefined) reject("Failed to load settings.");
      else resolve("Done fetching settings.");
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
