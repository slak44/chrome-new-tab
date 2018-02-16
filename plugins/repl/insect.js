'use strict';

// Insect requires setImmediate/clearImmediate
require('setimmediate');
const Insect = require('insect/output/Insect/index.js');
const ansiConverter = new (require('ansi-to-html'))();


// TODO completion
// Object.keys(insectEnv.values) identifiers
// Insect.functions(insectEnv) funcs
// Insect.supportedUnits units
// Insect.commands commands

let insectEnv = Insect.initialEnvironment;

function interpret(line, prompt) {
  // Skip empty lines and comments
  const lineTrimmed = line.trim();
  if (lineTrimmed === '' || lineTrimmed[0] === '#') return '';

  const res = Insect.repl(Insect.fmtConsole)(insectEnv)(line);
  insectEnv = res.newEnv;

  return ansiConverter.toHtml(res.msg);
}

module.exports = interpret;
