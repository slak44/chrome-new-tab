'use strict'
addCSS(['@-webkit-keyframes moveLeft {100% {-webkit-transform: translate('+(-$(window).width())+'px);}',
'@-webkit-keyframes moveRight {100% {-webkit-transform: translate('+$(window).width()+'px);}']);

function addCSS(elements) {
  for (var i = 0; i < elements.length; i++) {
    var newCss = document.createElement('style');
    newCss.type = 'text/css';
    newCss.appendChild(document.createTextNode(elements[i]));
    document.getElementsByTagName("head")[0].appendChild(newCss);
  }
}
