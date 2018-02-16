'use strict';

function moveCursorToEndOf(input) {
  // Adapted from: https://stackoverflow.com/a/3866442
  const range = document.createRange();
  range.selectNodeContents(input);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

class CommandHistory {
  constructor(historyId) {
    this.storageKey = `REPL-history-${historyId}`;
    this.prompts = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    this.pendingText = '';
    this.currentPromptDelta = this.prompts.length;
  }
  goUp() {
    if (this.currentPromptDelta === 0) return null;
    this.currentPromptDelta--;
    return this.prompts[this.currentPromptDelta];
  }
  goDown() {
    if (this.currentPromptDelta === this.prompts.length - 1) {
      this.currentPromptDelta++;
      return this.pendingText;
    } else if (this.currentPromptDelta === this.prompts.length) {
      return null;
    }
    this.currentPromptDelta++;
    return this.prompts[this.currentPromptDelta];
  }
  newValue(oldCommand) {
    if (oldCommand.trim() !== '') {
      this.prompts.push(oldCommand);
      this.currentPromptDelta = this.prompts.length;
      localStorage.setItem(this.storageKey, JSON.stringify(this.prompts));
    }
  }
  clearCurrentBuffer() {
    this.pendingText = '';
    this.currentPromptDelta = this.prompts.length;
  }
  currentTextChanged(newText) {
    if (this.currentPromptDelta === this.prompts.length) {
      this.pendingText = newText;
    }
  }
}

const promptStack = [];
class Prompt {
  constructor(name, promptText, writingElement, consoleElement, evaluate) {
    this.name = name;
    this.writingElement = writingElement;
    this.consoleElement = consoleElement;
    this.evaluate = evaluate;
    this.history = new CommandHistory(name, writingElement);
    api.insertStyle(`
      [data-current-prompt='${this.getClassName()}'] > .prompt > .prompt-text::before,
      .${this.getClassName()}:not(.result)::before {
        content: '${promptText}' !important;
      }
    `);
    writingElement.on('keyup change paste', event => this.history.currentTextChanged(writingElement.text()));
  }
  setCurrentText(val) {
    if (val !== null) {
      this.writingElement.text(val);
      moveCursorToEndOf(this.writingElement[0]);
    }
  }
  clearCurrentText() {
    this.writingElement.empty();
    this.history.clearCurrentBuffer();
  }
  goUp() {
    this.setCurrentText(this.history.goUp());
  }
  goDown() {
    this.setCurrentText(this.history.goDown());
  }
  getClassName() {
    return `prompt-${this.name.replace(/\s/g, '')}`;
  }
  appendResult(resultText) {
    this.consoleElement.append(`<span class="result ${this.getClassName()}">${resultText}</span>`);
  }
  appendFormerPrompt(promptText) {
    this.consoleElement.append(`<span class="former-prompt ${this.getClassName()}">${promptText}</span>`);
  }
  clearConsole() {
    this.consoleElement.find(`.result.${this.getClassName()}`).remove();
    this.consoleElement.find(`.former-prompt.${this.getClassName()}`).remove();
  }
  evaluateCurrentText() {
    const text = this.writingElement.text();
    this.writingElement.empty();
    this.history.newValue(text);
    this.appendFormerPrompt(text);
    this.writingElement.addClass('hidden');
    const resultText = this.evaluate(text, this);
    this.appendResult(resultText);
    this.writingElement.removeClass('hidden');
    this.scrollIntoView();
    return resultText;
  }
  scrollIntoView() {
    this.writingElement.focus();
    this.writingElement[0].scrollIntoView(false);
  }
  setIsCurrent() {
    promptStack.push(this);
    this.consoleElement.attr('data-current-prompt', this.getClassName());
  }
  static getCurrent() {
    return promptStack[promptStack.length - 1];
  }
  static quitCurrent() {
    if (promptStack.length === 1) return;
    const popped = promptStack.pop();
    popped.consoleElement.attr('data-current-prompt', '');
    this.getCurrent().consoleElement.attr('data-current-prompt', this.getCurrent().getClassName());
  }
}

module.exports = Prompt;
