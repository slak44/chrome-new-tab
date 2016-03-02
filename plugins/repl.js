'use strict';
function run() {
  setTimeout(function () {
    // Load currency conversion script & get currency rates
    let money = new XMLHttpRequest();
    money.onload = function () {
      eval.apply(window, [money.responseText]);
      // Get current exchange rates
      fx.base = 'EUR';
      let rates = new XMLHttpRequest();
      rates.onload = () => fx.rates = JSON.parse(rates.responseText).rates;
      rates.open('GET', 'https://api.fixer.io/latest');
      rates.send();
    };
    money.open('GET', 'https://raw.githubusercontent.com/openexchangerates/money.js/master/money.min.js');
    money.send();
  }, 0);
  setTimeout(function () {
    // Load quantity conversion script
    let quantityJs = new XMLHttpRequest();
    quantityJs.onload = function () {
      eval.apply(window, [quantityJs.responseText]);
    };
    quantityJs.open('GET', 'https://raw.githubusercontent.com/gentooboontoo/js-quantities/v1.6.0/src/quantities.js');
    quantityJs.send();
  }, 0);

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
    -webkit-user-select: initial;
    cursor: text;
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
  function openInNewTab(url) {
    let anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.click();
    return anchor.href;
  }
  // Syntax: `!COMMAND_NAME ARGS`
  // ARGS will be passed as a string to each command
  let commands = {
    convert: function (data) {
      // !convert 100 usd to EUR
      // !convert 50 m to km
      data = data.split(' ');
      if (data[2].toLowerCase() === 'to') data.splice(2, 1);
      // If the unit is currency, use the currency script
      if (Object.keys(fx.rates).includes(data[1])) {
        data[1] = data[1].toUpperCase();
        data[2] = data[2].toUpperCase();
        return fx.convert(Number(data[0]), {from: data[1], to: data[2]}).toFixed(2) + ` ${data[2]}`;
      }
      return Qty(`${data[0]} ${data[1]}`).to(data[2]).toString();
    },
    query: data => openInNewTab(`https://www.google.ro/search?q=${encodeURIComponent(data)}`),
    wolfram: data => openInNewTab(`http://www.wolframalpha.com/input/?i=${encodeURIComponent(data)}`)
  };
  let commandAliases = {
    cv: 'convert',
    q: 'query',
    w: 'wolfram'
  };
  
  const keycodes = {
    enter: 13,
    upArrow: 38,
    downArrow: 40
  };
  Object.freeze(keycodes);
  
  let result;
  let commandHistory = [];
  let rewindCount = 0;
  byId('repl-window').addEventListener('click', event => {
    if (event.target !== event.currentTarget) return; // Only catch direct clicks on the empty div
    event.preventDefault();
    byClass('current-text')[0].focus();
  });
  function replLog() {
    let text = Array.from(arguments).reduce((prev, curr) => prev + curr + '\n', '');
    byId('repl-window').insertAdjacentHTML('beforeend', `<span class="result-text">${text}</span>`);
  }
  function evaluate(event) {
    if (event.keyCode === keycodes.enter) {
      rewindCount = 0;
      let oldElem = byClass('current-text')[0];
      let code = oldElem.textContent
        .replace(/console\.(log|error|info|debug)/g, 'replLog') // Replace calls to 'console'
        .trim(); // Remove leading/trailing whitespace
      try {
        if (code.startsWith('!')) {
          let commandName = code.substr(1, code.indexOf(' ') - 1);
          result = (commands[commandName] || commands[commandAliases[commandName]])(code.replace(`!${commandName} `, ''));
        } else {
          /*jshint -W061 */
          result = eval(code);
        }
      } catch (err) {
        result = err;
      }
      commandHistory.push(code);
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
    } else if (event.keyCode === keycodes.upArrow) {
      rewindCount++;
      if (commandHistory.length - rewindCount < 0) rewindCount--;
      byClass('current-text')[0].innerText = commandHistory[commandHistory.length - rewindCount].toString();
    } else if (event.keyCode === keycodes.downArrow) {
      rewindCount--;
      if (rewindCount === 0) rewindCount++;
      byClass('current-text')[0].innerText = commandHistory[commandHistory.length - rewindCount].toString();
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
}
let plugin = {
  name: 'REPL',
  desc: 'Read-Eval-Print-Loop',
  author: 'Slak44',
  version: '2.1.6',
  main: run
};
/*jshint -W030 */
plugin;
