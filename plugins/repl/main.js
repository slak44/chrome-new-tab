'use strict';
const util = new PluginUtil(pluginName);
const fx = util.deps.money;
const Qty = util.deps['js-quantities'];

// Get current exchange rates
fx.base = 'EUR';
const rates = new XMLHttpRequest();
rates.onload = () => fx.rates = JSON.parse(rates.responseText).rates;
rates.open('GET', 'https://api.fixer.io/latest');
rates.send();

util.insertStyles(`
  span.history-selected {
    background-color: ${colorSchemes[0].accent4};
  }
`);
function openInNewTab(url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.click();
  return anchor.href;
}
// Syntax: `!COMMAND_NAME ARGS`
// ARGS will be passed as a string to each command
const commands = {
  convert(stringArgs) {
    // !convert 100 usd to EUR
    // !convert 50 m to km
    const args = stringArgs.split(' ');
    // Remove 'to' if it's found between units
    if (args[2].toLowerCase() === 'to') args.splice(2, 1);
    let {number, fromUnit, toUnit} = args;
    // If the unit is currency, use the currency script
    if (Object.keys(fx.rates).includes(args[1].toUpperCase())) {
      fromUnit = fromUnit.toUpperCase();
      toUnit = toUnit.toUpperCase();
      const result = fx.convert(Number(number), {fromUnit, toUnit}).toFixed(2);
      return `${result} ${toUnit}`;
    }
    return Qty(`${number} ${fromUnit}`).to(toUnit).toString();
  },
  query: data => openInNewTab(`https://www.google.ro/search?q=${encodeURIComponent(data)}`),
  wolfram: data => openInNewTab(`http://www.wolframalpha.com/input/?i=${encodeURIComponent(data)}`)
};
const commandAliases = {
  cv: 'convert',
  q: 'query',
  w: 'wolfram'
};

const replReplace = {
  replLog: /console\.(log|error|info|debug)/g,
  'Math.$1($2)': /(pow|exp|ceil|floor|trunc|log|max|min|random|sqrt|sin|cos|tan|asin|acos)\(([\s\S]*)\)/g,
  'Math.$1': /(PI|E)/g
};

function replLog(...args) {
  const text = args.reduce((prev, curr) => `${prev}${curr}\n`, '');
  byId('repl-window').insertAdjacentHTML('beforeend', `<span class="result-text">${text}</span>`);
}

const keycodes = {
  enter: 13,
  upArrow: 38,
  downArrow: 40
};
Object.freeze(keycodes);

window.result = undefined;
const commandHistory = [];
let rewindCount = 0;
function evaluate(event) {
  if (event.keyCode === keycodes.enter) {
    rewindCount = 0;
    const oldElem = byClass('current-text')[0];
    let code = oldElem.textContent.trim();
    commandHistory.pop();
    commandHistory.push(code);
    commandHistory.push('');
    try {
      if (code.startsWith('!')) {
        const commandName = code.substr(1, code.indexOf(' ') - 1);
        window.result = (commands[commandName] || commands[commandAliases[commandName]])(code.replace(`!${commandName} `, ''));
      } else {
        Object.keys(replReplace).forEach(key => code = code.replace(replReplace[key], key));
        window.result = window.eval(code);
      }
    } catch (err) {
      window.result = err;
    }
    oldElem.classList.remove('current-text');
    byId('repl-window').insertAdjacentHTML('beforeend', `
      <span class="result-text">${window.result}</span>
      <span class="current-text"></span>
    `);
    const oldHistory = byClass('history-selected')[0];
    if (oldHistory) oldHistory.classList.remove('history-selected');
    byId('repl-history').insertAdjacentHTML('beforeend', `
      <span class="history-selected">${window.result}</span>
    `);
    const historyElem = byClass('history-selected')[0];
    historyElem.addEventListener('click', event => {
      window.result = historyElem.textContent;
      byClass('history-selected')[0].classList.remove('history-selected');
      historyElem.classList.add('history-selected');
    });
    const newElem = byClass('current-text')[0];
    newElem.onkeydown = evaluate;
    newElem.focus();
    event.preventDefault();
  } else if (event.keyCode === keycodes.upArrow) {
    rewindCount++;
    if (commandHistory.length - rewindCount < 0) rewindCount--;
    let oldCommand = commandHistory[commandHistory.length - rewindCount].toString();
    if (oldCommand === '' && commandHistory.length - rewindCount - 1 > 0) oldCommand = commandHistory[commandHistory.length - rewindCount - 1].toString();
    byClass('current-text')[0].innerText = oldCommand;
  } else if (event.keyCode === keycodes.downArrow) {
    rewindCount--;
    if (rewindCount === 0) rewindCount++;
    byClass('current-text')[0].innerText = commandHistory[commandHistory.length - rewindCount].toString();
  }
}
byClass('current-text')[0].onkeydown = evaluate;
const repl = createButton({text: 'REPL'});
function toggle(e) {
  e.preventDefault();
  toggleDiv('repl-pane');
  toggleDiv('default-pane');
}
repl.addEventListener('click', toggle);
byId('repl-back').addEventListener('click', toggle);
