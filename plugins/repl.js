'use strict';
function run() {
  pluginCss.innerHTML += `
  #repl-pane {
    opacity: 0;
  }
  #repl-back {
    margin-top: 5px;
  }
  #repl-window {
    position: absolute;
    top: 60px;
    bottom: 60px;
    left: 10px;
  }
  #repl-window span:not(:first-child) {
    height: 20px;
    width: 100%;
    display: block;
  }
  #repl-history {
    position: absolute;
    top: 60px;
    bottom: 60px;
    right: 10px;
  }
  #repl-history span:not(:first-child) {
    cursor: pointer;
    width: 100%;
    display: block;
  }
  span.history-selected {
    background-color: ${colorScheme[0].accent4};
  }
  span.current-text {
    -webkit-user-modify: read-write;
    cursor: text;
    outline: none;
    box-shadow: none;
  }
  #repl-window span::before {
    content: '> ';
  }
  span.result-text::before {
    content: '< ' !important;
  }
  `;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="repl-pane" class="centered">
    <div class="row">
      <div class="col s3">
        <a id="repl-back" class="bgcolor lighten-2 waves-effect waves-light btn"><i class="material-icons left">arrow_back</i>Back</a>
      </div>
    </div>
    <div class="row">
      <div id="repl-window" class="card col s8">
        <span class="card-title grey-text text-darken-4">Console</span>
        <span class="current-text"></span>
      </div>
      <div id="repl-history" class="card col s3">
        <span class="card-title grey-text text-darken-4">Result History</span>
      </div>
    </div>
  </div>
  `);
  let result;
  byId('repl-window').addEventListener('click', event => {
    event.preventDefault();
    byClass('current-text')[0].focus();
  });
  function replLog() {
    let text = Array.from(arguments).reduce((prev, curr) => prev + curr + '\n', '');
    byId('repl-window').insertAdjacentHTML('beforeend', `<span class="result-text">${text}</span>`);
  }
  function evaluate(event) {
    if (event.keyCode === 13 /* Key code for Enter */) {
      let oldElem = byClass('current-text')[0];
      let code = oldElem.textContent.replace(/console\.(log|error|info|debug)/g, 'replLog'); // Replace calls to 'console'
      /*jshint -W061 */
      try {
        result = eval(code);
      } catch (error) {
        result = error;
      }
      oldElem.classList.remove('current-text');
      byId('repl-window').insertAdjacentHTML('beforeend', `
      <span class="result-text">${result}</span>
      <span class="current-text"></span>
      `);
      let oldHistory = byClass('history-selected')[0];
      if (oldHistory) oldHistory.classList.remove('history-selected');
      byId('repl-history').insertAdjacentHTML('beforeend', `
      <span class="history-selected">${result}</span>
      `);
      let historyElem = byClass('history-selected')[0];
      historyElem.addEventListener('click', event => {
        result = historyElem.textContent;
        byClass('history-selected')[0].classList.remove('history-selected');
        historyElem.classList.add('history-selected');
      });
      let newElem = byClass('current-text')[0];
      newElem.onkeydown = evaluate;
      newElem.focus();
      event.preventDefault();
    }
  }
  byClass('current-text')[0].onkeydown = evaluate;
  let repl = createButton({text: 'REPL'});
  function toggle(e) {
    e.preventDefault();
    toggleDiv('repl-pane');
    toggleDiv('default-pane');
  }
  repl.addEventListener('click', toggle);
  byId('repl-back').addEventListener('click', toggle);
  // Load currency conversion script & get currency rates
  let money = new XMLHttpRequest();
  money.onload = function () {
    eval.apply(window, [money.responseText]);
    // Syntactic sugar. Usage: convert('123 USD EUR')
    window.convert = function (data) {
      data = data.split(' ');
      return fx.convert(Number(data[0]), {from: data[1].toUpperCase(), to: data[2].toUpperCase()}).toFixed(2);
    };
    // Get current exchange rates
    fx.base = 'EUR';
    let rates = new XMLHttpRequest();
    rates.onload = () => fx.rates = JSON.parse(rates.responseText).rates;
    rates.open('GET', 'https://api.fixer.io/latest');
    rates.send();
  };
  money.open('GET', 'https://raw.githubusercontent.com/openexchangerates/money.js/master/money.min.js');
  money.send();
}
let plugin = {
  name: 'REPL',
  desc: 'Read-Eval-Print-Loop',
  author: 'Slak44',
  version: '2.0.1',
  main: run
};
/*jshint -W030 */
plugin;
