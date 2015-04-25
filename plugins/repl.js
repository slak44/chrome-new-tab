'use strict';
var ans;

if (identity === 'Main page') {
  settingsConfig.push(createCalc);
  mainButtons['REPL'] = new Button('assets/empty30x30.png', undefined, 'REPL');
  mainButtons['REPL'].setOnClick(show);
}

function createCalc() {
  appendHTML(document.body,
    '<div id="replPane" class="blockabsolute">\
    <textarea spellcheck=false id="tArea" style=" width: ' +
    ($(window).width() - 210) + 'px; height: ' +
    ($(window).height() - 110) + 'px; margin: 10px; margin-top: 100px; margin-left: 200px;"></textarea>\
    </div>');
  byId('replPane').style.display = 'none';
  byId('replPane').appendChild(new Button('assets/back.png', undefined, 'Go Back').aHref);
  byId('replPane').children[1].style.top = '0px';
  $(byId('replPane').children[1]).click(hide);
  byId('replPane').appendChild(new Button(undefined, undefined, 'Eval', true).aHref);
  byId('replPane').children[2].style.bottom = '10px';
  $(byId('replPane').children[2]).click(function () {
    console.log = (function () {
      var oldLog = console.log;
      return function () {
        byId('console').innerHTML = '';
        for (let i = 0; i < arguments.length; i++) byId('console').innerHTML += arguments[i] + ' ';
      }
    })();
    console.error = (function () {
      var oldErr = console.error;
      return function () {
        byId('console').innerHTML = '';
        for (let i = 0; i < arguments.length; i++) byId('console').innerHTML += arguments[i] + ' ';
      }
    })();
    ans = eval(byId('tArea').value);
    byId('out').innerHTML = ans;
  });
  var w = ($(window).width() - 210 - 10) / 2;
  appendHTML(byId('replPane'),
    '<textarea id="out" class="blockabsolute" style="left: 200px; top: 5px; right: 10px; height: 90px; width: '+w+'px;" disabled></textarea>');
  appendHTML(byId('replPane'),
    '<textarea id="console" class="blockabsolute" style="left: '+(200+w+10)+'px; top: 5px; right: 10px; height: 90px; width: '+w+'px;" disabled></textarea>');
}

function show() {
  byId('replPane').style.display = 'block';
  moveDiv('Left', 'defaultPane');
  moveDiv('Right', 'replPane');
}

function hide() {
  moveDiv('Right', 'defaultPane');
  moveDiv('Left', 'replPane');
}
