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
    <textarea id="tArea" style="width: ' +
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
    byId('out').innerHTML = eval(byId('tArea').value);
    ans = Number(byId('out').innerHTML);
    if (ans.toString() === NaN.toString()) ans = byId('out').innerHTML;
  });
  appendHTML(byId('replPane'),
    '<textarea id="out" class="blockabsolute" style="left: 200px; top: 5px; right: 10px; height: 90px;" disabled></textarea>');
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
