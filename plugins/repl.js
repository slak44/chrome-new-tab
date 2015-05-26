'use strict';
if (identity === 'Main page') {
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
    display: none;\
  }\
  #repl-flex {\
    position: absolute;\
    top: 100px;\
    width: 100%;\
    margin: 5px;\
    display: flex;\
  }';
  document.body.insertAdjacentHTML('beforeend',
  '<div id="repl-pane" class="unfocused">\
    <div id="repl-flex">\
      <div id="repl-input" class="repl-text" contenteditable="true"></div>\
      <div id="repl-output" class="repl-text"></div>\
      <div id="repl-console" class="repl-text"></div>\
    </div>\
  </div>');
  var back = new Button('assets/back.png', undefined, 'Go Back', byId('repl-pane'));
  var evalB = new Button(undefined, undefined, 'Eval', byId('repl-pane'));
  evalB.anchor.style.bottom = '0px';
  mainButtons.push(new Button(undefined, undefined, 'REPL'));
  function toggle(e) {
    e.preventDefault();
    byId('repl-pane').style.display = 'block';
    toggleDiv('repl-pane');
    toggleDiv('default-pane');
  }
  mainButtons[mainButtons.length - 1].anchor.addEventListener('click', toggle);
  back.anchor.addEventListener('click', function (e) {toggle(e); byId('repl-pane').style.display = 'none'});
  evalB.anchor.addEventListener('click', function (e) {
    e.preventDefault();
    ans = eval(byId('repl-input').innerHTML.replace(/console\.(log|error)/g, 'replLog')); // Replace calls to 'console'
    byId('repl-output').innerHTML = ans;
  });
  window.replLog = function () {
    byId('repl-console').innerHTML = '';
    for (let i = 0; i < arguments.length; i++) byId('repl-console').innerHTML += arguments[i] + '\n';
  }
}