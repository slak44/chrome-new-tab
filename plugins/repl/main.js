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

// Command syntax: `!COMMAND_NAME ARGS`
// ARGS will be passed as a string to each command
const executeCommand = (function () {
  function openInNewTab(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.click();
    return anchor.href;
  }
  const commands = {
    convert(stringArgs) {
      // !convert 100 usd to EUR
      // !convert 50 m to km
      const args = stringArgs.split(' ');
      // Remove 'to' if it's found between units
      if (args[2].toLowerCase() === 'to') args.splice(2, 1);
      let [number, fromUnit, toUnit] = args;
      // If the unit is currency, use the currency script
      if (Object.keys(fx.rates).includes(toUnit.toUpperCase())) {
        fromUnit = fromUnit.toUpperCase();
        toUnit = toUnit.toUpperCase();
        const result = fx.convert(Number(number), {from: fromUnit, to: toUnit}).toFixed(2);
        return `${result} ${toUnit}`;
      }
      return Qty(`${number} ${fromUnit}`).to(toUnit).toString();
    },
    query: data => openInNewTab(`https://www.google.com/search?q=${encodeURIComponent(data)}`),
    wolfram: data => openInNewTab(`http://www.wolframalpha.com/input/?i=${encodeURIComponent(data)}`),
    winrate(stringArgs) {
      /* eslint-disable no-magic-numbers */
      const args = stringArgs.split(' ');
      const [wins, losses] = args.map(arg => parseInt(arg, 10));
      const winrate = wins * 100 / (losses + wins);
      return `${winrate.toFixed(2)}%`;
      /* eslint-enable no-magic-numbers */
    }
  };
  const commandAliases = {
    cv: 'convert',
    q: 'query',
    w: 'wolfram',
    wr: 'winrate'
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
  return function (code) {
    try {
      if (code.startsWith('!')) {
        const commandName = code.substr(1, code.indexOf(' ') - 1); // Skip ! character, and go until the first space
        const commandArgs = code.replace(`!${commandName} `, '');
        const commandFunc = commands[commandName] || commands[commandAliases[commandName]];
        if (!(commandFunc instanceof Function)) throw new Error('Command not found');
        window.result = commandFunc(commandArgs);
      } else {
        let replaceable = code;
        Object.keys(replReplace).forEach(key => replaceable = replaceable.replace(replReplace[key], key));
        window.result = window.eval(replaceable);
      }
    } catch (err) {
      window.result = err;
    }
  };
})();

function REPL() {
  const commandHistory = [];
  let rewindCount = 0;
  this.currentElement = byClass('current-text')[0];
  this.currentHistory = byClass('history-selected')[0];
  byId('repl-history').addEventListener('click', event => {
    // Ignore the title
    if (Array.from(event.target.classList).includes('card-title')) return;
    this.currentHistory.classList.remove('history-selected');
    event.target.classList.add('history-selected');
    window.result = event.target.innerText;
    this.currentHistory = event.target;
  });
  const insertResult = () => {
    this.currentElement.classList.remove('current-text');
    byId('repl-window').insertAdjacentHTML('beforeend', `
      <span class="result-text">${window.result}</span>
      <span class="current-text"></span>
    `);
    this.currentElement = byClass('current-text')[0];
    this.currentElement.focus();
  };
  const insertHistory = () => {
    if (this.currentHistory) this.currentHistory.classList.remove('history-selected');
    byId('repl-history').insertAdjacentHTML('beforeend', `
      <span class="history-selected">${window.result}</span>
    `);
    this.currentHistory = byClass('history-selected')[0];
  };
  this.run = () => {
    rewindCount = 0;
    const code = this.currentElement.textContent.trim();
    commandHistory.shift(); // Remove the empty string added below
    commandHistory.unshift(code); // Add this command's code
    commandHistory.unshift(''); //  Add empty string (will be replaced by the above lines on next run)
    executeCommand(code);
    insertResult();
    insertHistory();
  };
  const getRewindedCommand = () => commandHistory[rewindCount].toString();
  this.rewind = () => {
    rewindCount++;
    // Don't actually rewind if we're at the history limit
    if (rewindCount === commandHistory.length) rewindCount--;
    this.currentElement.innerText = getRewindedCommand();
  };
  this.forward = () => {
    rewindCount--;
    // Don't go before the newest item
    if (rewindCount === -1) rewindCount++;
    this.currentElement.innerText = getRewindedCommand();
  };
}

const keycodes = {
  enter: 13,
  upArrow: 38,
  downArrow: 40
};
Object.freeze(keycodes);

window.result = undefined;
const repl = new REPL();
byId('repl-window').addEventListener('keydown', event => {
  switch (event.keyCode) {
    case keycodes.enter:
      repl.run();
      event.preventDefault();
      break;
    case keycodes.upArrow:
      repl.rewind();
      break;
    case keycodes.downArrow:
      repl.rewind();
      break;
  }
});
const replBtn = createButton({text: 'REPL'});
function toggle(e) {
  e.preventDefault();
  toggleDiv('repl-pane');
  toggleDiv('default-pane');
}
replBtn.addEventListener('click', toggle);
byId('repl-back').addEventListener('click', toggle);
