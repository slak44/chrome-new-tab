'use strict';
function run() {
  var ans;
  pluginCss.innerHTML +=
  '.repl-text {\
    background-color: #FFFFFF;\
    bottom: 5px;\
    margin: auto;\
    width: 300px;\
    height: 500px;\
    -webkit-user-select: all;\
    cursor: text;\
  }\
  #repl-pane {\
    opacity: 0;\
  }\
  #repl-flex {\
    top: 100px;\
    display: flex;\
  }';
  document.body.insertAdjacentHTML('beforeend',
  '<div id="repl-pane" class="centered">\
    <div id="repl-flex" class="centered">\
      <div id="repl-input" class="repl-text" contenteditable="true"></div>\
      <div id="repl-output" class="repl-text"></div>\
      <div id="repl-console" class="repl-text"></div>\
    </div>\
  </div>');
  var back = new Button('assets/back.png', undefined, 'Go Back', byId('repl-pane'));
  var evalB = new Button(undefined, undefined, 'Eval', byId('repl-pane'));
  var repl = new Button(undefined, undefined, 'REPL');
  function toggle(e) {
    e.preventDefault();
    toggleDiv('repl-pane');
    toggleDiv('default-pane');
  }
  repl.anchor.addEventListener('click', toggle);
  back.anchor.addEventListener('click', toggle);
  evalB.anchor.addEventListener('click', function (e) {
    e.preventDefault();
    ans = eval(byId('repl-input').innerHTML.replace(/console\.(log|error)/g, 'replLog')); // Replace calls to 'console'
    byId('repl-output').innerHTML = ans;
  });
  window.replLog = function () {
    byId('repl-console').innerHTML = '';
    for (var i = 0; i < arguments.length; i++) byId('repl-console').innerHTML += arguments[i] + '\n';
  }
  // Load currency conversion script & get currency rates
  var money = new XMLHttpRequest();
  money.onload = function () {
    eval.apply(window, [this.responseText]);
    // Syntactic sugar. Usage: convert('123 USD EUR')
    window.convert = function (data) {
      data = data.split(' ');
      return Math.trunc(
        fx.convert(Number(data[0]), {from: data[1].toUpperCase(), to: data[2].toUpperCase()})
        * 100) / 100; // Reduce to 2 decimals
    }
    // Get current exchange rates
    fx.base = 'EUR';
    var rates = new XMLHttpRequest();
    rates.onload = function () {fx.rates = JSON.parse(this.responseText).rates}
    rates.open('GET', 'https://api.fixer.io/latest');
    rates.send();
  }
  money.open('GET', 'https://raw.githubusercontent.com/openexchangerates/money.js/master/money.min.js');
  money.send();
}
var plugin = {
  name: 'REPL',
  desc: 'Read-Eval-Print-Loop',
  author: 'Slak44',
  version: '1.1',
  main: run
};
plugin;
