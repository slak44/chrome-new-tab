'use strict';
var onSettingsLoad = [];
var settingsConfig = [];
var mainButtons = {
  "Gmail":      new Button("assets/gmail.png", "https://mail.google.com/mail/?authuser=0", "Gmail"),
  "Youtube":    new Button("assets/youtube.png", "https://www.youtube.com/?gl=RO&authuser=0", "Youtube"),
  "Translate":  new Button("assets/translate.png", "https://translate.google.com/?hl=en&authuser=0", "Translate"),
  "Reddit":     new Button("assets/reddit.png", "https://www.reddit.com", "Reddit"),
  "GitHub":     new Button("assets/github.png", "https://github.com/", "GitHub"),
  "LoLNexus":   new Button("assets/lolnexus.png", "http://www.lolnexus.com/EUNE/search?name=slak44&region=EUNE", "LoLNexus"),
  "Extensions": new Button("assets/extensions.png", undefined, "Extensions"),
  "LoL Data":   new Button("assets/lol.png", undefined, "LoL Data")
};

addCSS(
'@-webkit-keyframes moveLeft {100% {-webkit-transform: translate('+(-$(window).width())+'px);}}'+
'@-webkit-keyframes moveRight {100% {-webkit-transform: translate('+$(window).width()+'px);}}'
);

function addCSS(css) {
  var newCss = document.createElement('style');
  newCss.type = 'text/css';
  newCss.appendChild(document.createTextNode(css));
  document.getElementsByTagName("head")[0].appendChild(newCss);
}

/*Button prototype.*/
function Button(imagePath, href, preText) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  //Set a link if there is one, make sure the cursor looks good if there isn't
  if (href !== undefined) link.href = href;
  else link.style.cursor = "pointer";
  link.id = preText;
  $(link).toggleClass("blockabsolute button");
  $(text).toggleClass("globalText buttonText");
  text.innerHTML = preText;
  link.style.backgroundImage = "url('"+imagePath+"'), url('assets/button.png')"
  this.aHref = link;
  this.setOnClick = function(what) {
    $(this.aHref).click(what);
  }
}
