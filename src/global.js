/*Button prototype.*/
function Button(imagePath, href, preText) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  //If there is no href, make sure the cursor looks as if there was
  if (href !== undefined) link.href = href;
  else link.style.cursor = "pointer";
  link.id = preText;
  $(link).toggleClass("blockabsolute button");
  $(text).toggleClass("globalText buttonText");
  text.innerHTML = preText;
  link.style.backgroundImage = "url('"+imagePath+"'), url('assets/button.png')";
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

/*Clear the storage.*/
function clearStorage() {
  settings = {};
  chrome.storage.local.clear();
}

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
