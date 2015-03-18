'use strict';
addCSS(
'@-webkit-keyframes moveLeft {100% {-webkit-transform: translate('+(-$(window).width())+'px);}'+
'@-webkit-keyframes moveRight {100% {-webkit-transform: translate('+$(window).width()+'px);}'
);

function addCSS(css) {
  var newCss = document.createElement('style');
  newCss.type = 'text/css';
  newCss.appendChild(document.createTextNode(css));
  document.getElementsByTagName("head")[0].appendChild(newCss);
}
