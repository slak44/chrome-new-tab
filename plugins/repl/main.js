'use strict';
const fx = require('money');
const Qty = require('js-quantities');

api.insertStyle(`#repl-activity .console-text {background-color: ${themes[currentThemeIdx].background};}`);
api.insertStyle(`#repl-activity .history span.selection {background-color: ${themes[currentThemeIdx].accent};}`);

// Get current exchange rates
$.get('https://api.fixer.io/latest', data => fx.rates = data.rates, 'json');
fx.base = 'EUR';

const container = $('#repl-activity');
const consoleList = container.find('.console-text');
const history = container.find('.history');

const commands = [];
class Command {
  constructor(name, alias, action) {
    this.name = name;
    this.alias = alias;
    this.action = action;
    commands.push(this);
  }
  static fetchActionFor(nameOrAlias) {
    const command = commands.find(command => command.name === nameOrAlias || command.alias === nameOrAlias);
    return command ? command.action : null;
  }
}

new Command('convert', 'cv', stringArgs => {
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
});

new Command('winrate', 'wr', stringArgs => {
  /* eslint-disable no-magic-numbers */
  const args = stringArgs.split(' ');
  const [wins, losses] = args.map(arg => parseInt(arg, 10));
  const winrate = wins * 100 / (losses + wins);
  return `${winrate.toFixed(2)}%`;
  /* eslint-enable no-magic-numbers */
});

function openInNewTab(url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.click();
  return anchor.href;
}
new Command('query', 'q', data => openInNewTab(`https://www.google.com/search?q=${encodeURIComponent(data)}`));
new Command('wolfram', 'w', data => openInNewTab(`http://www.wolframalpha.com/input/?i=${encodeURIComponent(data)}`));

// Command syntax: `!COMMAND_NAME ARGS`
// ARGS will be passed as a string to each command
const executeCommand = (function () {
  const replReplace = {
    replLog: /console\.(log|error|info|debug)/g,
    'Math.$1($2)': /(pow|exp|ceil|floor|trunc|log|max|min|random|sqrt|sin|cos|tan|asin|acos)\(([\s\S]*)\)/g,
    'Math.$1': /(PI|E)/g
  };
  window.replLog = function replLog(...args) {
    const text = args.reduce((prev, curr) => `${prev}${curr}\n`, '');
    consoleList.append(`<span class="result">${text}</span>`);
  };
  return function (code) {
    try {
      if (code.startsWith('!')) {
        const firstSpace = code.indexOf(' ');
        // Skip ! character, and go until the first space, or until the end if there are no spaces
        const commandName = firstSpace > -1 ? code.substr(1, firstSpace - 1) : code.slice(1);
        const commandArgs = code.replace(new RegExp(`!${commandName} ?`), '');
        const action = Command.fetchActionFor(commandName);
        if (!(action instanceof Function)) throw new Error('Command not found');
        window.ans = action(commandArgs);
      } else {
        let replaceable = code;
        Object.keys(replReplace).forEach(key => replaceable = replaceable.replace(replReplace[key], key));
        window.ans = window.eval(replaceable);
      }
    } catch (err) {
      window.ans = err;
    }
  };
})();

const historyAnswers = container.find('ol.answers');
const promptWrite = container.find('span.prompt-write');

const prompts = [];
const results = [];
let pendingText = '';
let currentPromptDelta = 0;

function moveCursorToEnd() {
  // Adapted from: https://stackoverflow.com/a/3866442
  const range = document.createRange();
  range.selectNodeContents(promptWrite[0]);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

promptWrite.on('keydown', event => {
  switch (event.key) {
    case 'Enter': {
      if (event.shiftKey) return;
      const text = promptWrite.text();
      promptWrite.empty();
      prompts.push(text);
      currentPromptDelta = prompts.length;
      consoleList.append(`<span class="former-prompt">${text}</span>`);
      promptWrite.addClass('hidden');
      executeCommand(text);
      results.push(window.ans);
      consoleList.append(`<span class="result">${window.ans}</span>`);
      historyAnswers.find('.selection').removeClass('selection');
      const res = $(`<li class="selection" data-result-idx="${results.length - 1}">${window.ans}</li>`);
      res.click(event => {
        historyAnswers.find('.selection').removeClass('selection');
        res.addClass('selection');
        window.ans = results[res.data('result-idx')];
      });
      historyAnswers.append(res);
      promptWrite.removeClass('hidden');
      promptWrite.focus();
      promptWrite[0].scrollIntoView(false);
      break;
    }
    case 'ArrowUp':
      if (currentPromptDelta === 0) break;
      currentPromptDelta--;
      promptWrite.text(prompts[currentPromptDelta]);
      moveCursorToEnd();
      break;
    case 'ArrowDown':
      if (currentPromptDelta === prompts.length - 1) {
        promptWrite.text(pendingText);
        moveCursorToEnd();
        currentPromptDelta++;
        break;
      } else if (currentPromptDelta === prompts.length) {
        break;
      }
      currentPromptDelta++;
      promptWrite.text(prompts[currentPromptDelta]);
      moveCursorToEnd();
      break;
    case 'c':
      if (event.ctrlKey) {
        const text = `${promptWrite.text()}^C`;
        promptWrite.empty();
        pendingText = '';
        currentPromptDelta = prompts.length;
        consoleList.append(`<span class="former-prompt">${text}</span>`);
        break;
      }
      return;
    default: return;
  }
  event.preventDefault();
});

promptWrite.on('keyup change paste', event => {
  if (currentPromptDelta === prompts.length) {
    pendingText = promptWrite.text();
  }
});

container.find('.clear-history').click(event => historyAnswers.empty());
container.find('.clear-console').click(event => consoleList.children(':not(.prompt)').remove());
