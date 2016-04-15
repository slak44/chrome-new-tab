window.fx = window.money;
window.Qty = window['js-quantities'];

// Get current exchange rates
fx.base = 'EUR';
let rates = new XMLHttpRequest();
rates.onload = () => fx.rates = JSON.parse(rates.responseText).rates;
rates.open('GET', 'https://api.fixer.io/latest');
rates.send();

pluginCss.innerHTML += `
span.history-selected {
  background-color: ${colorSchemes[0].accent4};
}
`;
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
    if (Object.keys(fx.rates).includes(data[1].toUpperCase())) {
      data[1] = data[1].toUpperCase();
      data[2] = data[2].toUpperCase();
      return fx.convert(Number(data[0]), {from: data[1], to: data[2]}).toFixed(2) + ` ${data[2]}`;
    }
    /* jshint -W117 */
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

let replReplace = {
  'replLog': /console\.(log|error|info|debug)/g,
  'Math.$1($2)': /(pow|exp|ceil|floor|trunc|log|max|min|random|sqrt|sin|cos|tan|asin|acos)\((\S*)\)/g,
  'Math.$1': /(PI|E)/g,
};

function replLog() {
  let text = Array.from(arguments).reduce((prev, curr) => prev + curr + '\n', '');
  byId('repl-window').insertAdjacentHTML('beforeend', `<span class="result-text">${text}</span>`);
}

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
function evaluate(event) {
  if (event.keyCode === keycodes.enter) {
    rewindCount = 0;
    let oldElem = byClass('current-text')[0];
    let code = oldElem.textContent.trim();
    commandHistory.push(code);
    Object.keys(replReplace).forEach(key => code = code.replace(replReplace[key], key));
    try {
      if (code.startsWith('!')) {
        let commandName = code.substr(1, code.indexOf(' ') - 1);
        result = (commands[commandName] || commands[commandAliases[commandName]])(code.replace(`!${commandName} `, ''));
      } else {
        result = eval(code); // jshint ignore: line
      }
    } catch (err) {
      result = err;
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
