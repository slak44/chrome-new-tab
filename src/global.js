'use strict';
var plugins = [];
var settings = {};

addCSS(
'@-webkit-keyframes moveLeft {100% {-webkit-transform: translate('+(-$(window).width())+'px);}}\n'+
'@-webkit-keyframes moveRight {100% {-webkit-transform: translate('+($(window).width())+'px);}}'
);

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
function Button(imagePath, href, preText, textOnly, id) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  //If there is no href, make sure the cursor looks as if there was
  if (href !== undefined) link.href = href;
  else link.style.cursor = "pointer";
  link.id = (id === undefined)? preText : id;
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
  this.serializableNode = this.aHref.outerHTML;
  this.setOnClick = function(what) {
    $(this.aHref).click(what);
  }
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

/*Move divs around.*/
function moveDiv(side, id) {
  if (side === "Left") {
    byId(id).style.left = "0px";
    $(byId(id)).removeClass("goRight");
    $(byId(id)).addClass("goLeft");
  } else if (side === "Right") {
    byId(id).style.left = -$(window).width() + "px";
    $(byId(id)).removeClass("goLeft");
    $(byId(id)).addClass("goRight");
  }
}

function addCSS(cssString) {
  var newCss = document.createElement('style');
  newCss.type = 'text/css';
  newCss.appendChild(document.createTextNode(cssString));
  document.getElementsByTagName("head")[0].appendChild(newCss);
}

/*
Adds the given strings(pass strings after parent) as html to the
specified parent(html object or id as string).
*/
function appendHTML(parent) {
  if (isType(parent, "string"))
    for (var i = 1; i < arguments.length; i++)
      byId(parent).insertAdjacentHTML('beforeend', arguments[i]);
  else
    for (var i = 1; i < arguments.length; i++)
      parent.insertAdjacentHTML('beforeend', arguments[i]);
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

function checkType(thing, type) {
  if ($.type(thing) !== type) new Error(thing+"'s type doesn't match "+type+".");
}

function isType(thing, type) {
  if ($.type(thing) !== type) return false;
  else return true;
}
