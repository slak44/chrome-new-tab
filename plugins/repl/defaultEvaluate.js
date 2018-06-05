'use strict';

const fx = require('money');
const Qty = require('js-quantities');

// Get current exchange rates
$.get('https://api.fixer.io/latest', data => fx.rates = data.rates, 'json');
fx.base = 'EUR';

const commands = [];
// Command syntax: `!COMMAND_NAME ARGS`
// ARGS will be passed as a string to each command
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
  const args = stringArgs.split(' ').filter(arg => !/^\s+$/.test(arg));
  if (args.length !== 2) throw Error('Too many or too few arguments; need 2');
  let wins = null;
  let losses = null;
  let total = null;
  const others = [];
  args.forEach(arg => {
    const testNr = Number(arg.slice(0, -1));
    if (isNaN(testNr)) throw Error(`Bad format for "${arg}" (only the last char can specify type)`);
    const kind = arg[arg.length - 1].toLowerCase();
    let nr;
    if (/^\d$/.test(kind)) nr = Number(arg);
    else nr = testNr;
    if (isNaN(nr) || arg === '') throw Error(`Bad format for "${arg}"`);
    if (kind === 'w') wins = nr;
    else if (kind === 'l') losses = nr;
    else if (kind === 't') total = nr;
    else others.push(nr);
  });
  let winrate;
  if (others.length === 1) throw Error('Can\'t mix typed and untyped values');
  if (others.length === 2) [wins, losses] = others;
  if (wins === null) winrate = 100 - (losses * 100 / total);
  else if (losses === null) winrate = wins * 100 / total;
  else if (total === null) winrate = wins * 100 / (losses + wins);
  else throw Error('Illegal state, enough args but not enough data to calculate winrate');
  console.log(wins, losses, total, others, winrate);
  return `${winrate.toFixed(2)}%`;
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

const replReplace = {
  replLog: /console\.(log|error|info|debug)/g,
  'Math.$1($2)': /(pow|exp|ceil|floor|trunc|log|max|min|random|sqrt|sin|cos|tan|asin|acos)\(([\s\S]*)\)/g,
  'Math.$1': /(PI|E)/g
};

function evalJs(code, prompt) {
  window.replLog = function replLog(...args) {
    const text = args.reduce((prev, curr) => `${prev}${curr}\n`, '');
    prompt.appendResult(text);
  };
  try {
    if (code.startsWith('!')) {
      const firstSpace = code.indexOf(' ');
      // Skip ! character, and go until the first space, or until the end if there are no spaces
      const commandName = firstSpace > -1 ? code.substr(1, firstSpace - 1) : code.slice(1);
      const commandArgs = code.replace(new RegExp(`!${commandName} ?`), '');
      const action = Command.fetchActionFor(commandName);
      if (!(action instanceof Function)) throw new Error('Command not found');
      return window.ans = action(commandArgs);
    } else {
      let replaceable = code;
      Object.keys(replReplace).forEach(key => replaceable = replaceable.replace(replReplace[key], key));
      return window.ans = window.eval(replaceable);
    }
  } catch (err) {
    return window.ans = err;
  }
}

module.exports = {
  evalJs,
  Command
};
