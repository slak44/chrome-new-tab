'use strict';

import 'global';
import {sorted as sortedButtons, insertButton} from 'buttons';

const alignments = ['left', 'center', 'right'];
pluginApi.insertView = (plugin, htmlElement, order, alignment) => {
  if (!alignments.includes(alignment)) throw Error(`Illegal allignment "${alignment}"; valid: ${alignments.join(' ')}`);
  if (!(htmlElement instanceof HTMLElement)) throw Error('The argument htmlElement must be of type HTMLElement');
  htmlElement.style.order = order;
  $(`#${alignment}`).append(htmlElement);
};

const activityStack = [];

class Activity {
  constructor(name, htmlElement) {
    if (!(htmlElement instanceof HTMLElement)) throw Error('The argument htmlElement must be of type HTMLElement');
    this.name = name;
    this.element = $(htmlElement);
  }
  show() {
    $('.activity-title').text(this.name);
    this.element.removeClass('hidden');
  }
  hide() {
    this.element.addClass('hidden');
  }
  static current() {
    return activityStack[activityStack.length - 1];
  }
}

activityStack.push(new Activity('New Tab', $('main.activity')[0]));

pluginApi.pushActivity = (plugin, activityName, htmlElement) => {
  // No duplicates
  if (Activity.current().name === activityName) return;
  Activity.current().hide();
  const a = new Activity(activityName, htmlElement);
  a.show();
  activityStack.push(a);
  $('.activity-up-btn').removeClass('hidden');
};

pluginApi.popActivity = plugin => {
  if (activityStack.length === 1) return;
  activityStack.pop().hide();
  Activity.current().show();
  if (activityStack.length === 1) $('.activity-up-btn').addClass('hidden');
};

$('.activity-up-btn').click(pluginApi.popActivity);

const buttonsLoaded = storage.loadCached(storage.cacheable.buttons, buttonsText => {
  window.buttons = JSON.parse(buttonsText);
  buttons.forEach(button => insertButton(button, $('#buttons')[0]));
});

$(document).ready(() => {
  plugins.forEach(plugin => runViewContent(plugin, 'global'));
  plugins.forEach(plugin => runViewContent(plugin, 'main'));
  if (!buttonsLoaded) {
    const sorted = sortedButtons();
    sorted.forEach(button => insertButton(button, $('#buttons')[0]));
    storage.storeCached(storage.cacheable.buttons, JSON.stringify(sorted));
  }
});

$(document).on('keydown', e => {
  if (e.altKey) location.replace(
    buttons.find(button => button.hotkey && button.hotkey.toUpperCase().charCodeAt() === e.keyCode).href
  );
});
