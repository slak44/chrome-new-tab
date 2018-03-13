'use strict';

const Prompt = require('./prompt.js');
const {evalJs, Command} = require('./defaultEvaluate.js');

api.insertStyle(`#repl-activity .console-text {background-color: ${stored.themes[stored.currentThemeIdx].background};}`);
api.insertStyle(`#repl-activity .history span.selection {background-color: ${stored.themes[stored.currentThemeIdx].accent};}`);

const container = $('#repl-activity');
const consoleList = container.find('.console-text');

const historyAnswers = container.find('ol.answers');
const promptWrite = container.find('span.prompt-write');

const defaultPrompt = new Prompt('default', '$', promptWrite, consoleList, evalJs);
defaultPrompt.setIsCurrent();

const insectPrompt = new Prompt('insect', '>>>', promptWrite, consoleList, require('./insect.js'));
new Command('insect', 'i', () => {
  insectPrompt.setIsCurrent();
  return '';
});

const results = [];
function addResultToHistory(resText) {
  results.push(resText);
  historyAnswers.find('.selection').removeClass('selection');
  const res = $(`<li class="selection" data-result-idx="${results.length - 1}">${resText}</li>`);
  res.click(event => {
    historyAnswers.find('.selection').removeClass('selection');
    res.addClass('selection');
    window.ans = results[res.data('result-idx')];
  });
  historyAnswers.append(res);
}

promptWrite.on('keydown', event => {
  switch (event.key) {
    case 'Enter': {
      if (event.shiftKey) return;
      switch (promptWrite.text().trim()) {
        case 'clear':
          container.find('.clear-console').click();
          Prompt.getCurrent().clearCurrentText();
          break;
        case 'quit':
        case 'exit':
          Prompt.getCurrent().appendFormerPrompt(promptWrite.text());
          Prompt.quitCurrent();
          Prompt.getCurrent().clearCurrentText();
          break;
        default: {
          const resText = Prompt.getCurrent().evaluateCurrentText();
          addResultToHistory(resText);
          break;
        }
      }
      event.preventDefault();
      return;
    }
    case 'ArrowUp':
      Prompt.getCurrent().goUp();
      event.preventDefault();
      return;
    case 'ArrowDown':
      Prompt.getCurrent().goDown();
      event.preventDefault();
      return;
    case 'c':
      if (event.ctrlKey) {
        Prompt.getCurrent().appendFormerPrompt(`${promptWrite.text()}^C`);
        Prompt.getCurrent().clearCurrentText();
        event.preventDefault();
        return;
      }
      return;
    default: return;
  }
});

container.find('.clear-history').click(event => historyAnswers.empty());
container.find('.clear-console').click(event => consoleList.children(':not(.prompt)').remove());
