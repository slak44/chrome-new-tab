'use strict';

/*
  Runs inside the single sandboxed iframe embedded by each host page. MV3 forbids
  'unsafe-eval' in extension pages, but the sandbox CSP still allows it, so all
  plugin code is eval'd here. One iframe hosts ALL of the page's plugins in one
  shared realm and owns the rendered views + activity stack (its own #left /
  #center / #right sections and #base-activity live in sandbox.html). Only things
  that need the host's origin/privileges cross back over postMessage: network,
  persistence, chrome.*, button actions, toasts and the fade overlay.

  This is deliberately close to the old on-page engine (global.js + main.js):
  pluginApi / bindApi / runViewContent / the Activity stack are reproduced here,
  with the privileged bits turned into bridge calls.
*/

import {
  SANDBOX_READY, REGISTER_ACTION, ACTIVITY_STATE, NET_FETCH, CACHE_GET, CACHE_SET,
  OPEN_TAB, TOAST, FADE_CONFIG, FADE_ACTIVITY, FADE_FEATURED, RUN_DONE, SEED, RUN,
  ACTION_INVOKE, POP_REQUEST, NET_RESULT, CACHE_RESULT, buildActionUri
} from 'plugin-bridge';

// Globals the plugin code expects (plugins reference bare `$`, `Materialize`,
// `stored`, `window.eval`), exactly as the old on-page engine provided them.
window.$ = window.jQuery = require('jquery');
window.Materialize = require('materialize-css');
window.SHORT_DURATION_MS = 3000;
window.LONG_DURATION_MS = 10000;
const $ = window.$;

const plugins = {};                // name -> plugin object, populated as views run
const actionHandlers = new Map();  // action:// uri -> handler fn

// ---- host communication ----------------------------------------------------

function post(type, payload) {
  parent.postMessage(Object.assign({type}, payload), '*');
}

let reqSeq = 0;
const pending = new Map();
function request(type, payload) {
  return new Promise(resolve => {
    const reqId = ++reqSeq;
    pending.set(reqId, resolve);
    post(type, Object.assign({reqId}, payload));
  });
}

// ---- activity stack (in-iframe, mirrors the old main.js) --------------------

const activityStack = [];
class Activity {
  constructor(name, htmlElement) {
    if (!(htmlElement instanceof HTMLElement)) throw Error('The argument htmlElement must be of type HTMLElement');
    this.name = name;
    this.element = $(htmlElement);
  }
  show() { this.element.removeClass('hidden'); }
  hide() { this.element.addClass('hidden'); }
  static current() { return activityStack[activityStack.length - 1]; }
}

function notifyActivityState() {
  post(ACTIVITY_STATE, {title: Activity.current().name, canGoBack: activityStack.length > 1});
}

// ---- the plugin API (first arg is the plugin, bound by bindApi) -------------

const alignments = ['left', 'center', 'right'];
const pluginApi = {
  setting(plugin, name) {
    const obj = plugin.settings.filter(s => s.name === name)[0];
    return obj.value ? obj.value : obj.default;
  },
  insertStyle(plugin, css) {
    $('#plugin-css').append(css);
  },
  insertView(plugin, htmlElement, order, alignment) {
    if (!alignments.includes(alignment)) throw Error(`Illegal alignment "${alignment}"; valid: ${alignments.join(' ')}`);
    if (!(htmlElement instanceof HTMLElement)) throw Error('The argument htmlElement must be of type HTMLElement');
    htmlElement.style.order = order;
    $(`#${alignment}`).append(htmlElement);
  },
  pushActivity(plugin, activityName, htmlElement) {
    if (Activity.current().name === activityName) return;
    Activity.current().hide();
    const a = new Activity(activityName, htmlElement);
    a.show();
    activityStack.push(a);
    notifyActivityState();
  },
  popActivity() {
    if (activityStack.length === 1) return;
    activityStack.pop().hide();
    Activity.current().show();
    notifyActivityState();
  },
  registerAction(plugin, displayName, actionPathname, handler) {
    const uri = buildActionUri(plugin.name, actionPathname);
    actionHandlers.set(uri, handler);
    post(REGISTER_ACTION, {displayName, actionPathname, pluginName: plugin.name});
  },
  // Cross-origin GET performed by the host; resolves with the parsed JSON body.
  get(plugin, url) {
    return request(NET_FETCH, {url, dataType: 'json'}).then(res => {
      if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
      return res.body;
    });
  },
  fetch(plugin, url, options) {
    return request(NET_FETCH, {url, options});
  },
  cacheGet(plugin, key) {
    return request(CACHE_GET, {key});
  },
  cacheSet(plugin, key, value) {
    post(CACHE_SET, {key, value});
  },
  openTab(plugin, url, active = true) {
    post(OPEN_TAB, {url, active});
  },
  toast(plugin, text) {
    post(TOAST, {text});
  },
  // Host-side fade overlay (see plugin-host.js): the overlay must cover the whole
  // page (host chrome included) and detect activity there, so the fade plugin
  // drives it from here. Featured content is cloned from this shared iframe DOM
  // and mirrored onto the overlay.
  configureFade(plugin, opts) {
    post(FADE_CONFIG, opts);
  },
  fadeActivity() {
    post(FADE_ACTIVITY, {});
  },
  fadeFeatured(html) {
    post(FADE_FEATURED, {html});
  }
};

// Returns an api object whose functions have their first argument bound to the plugin.
window.bindApi = pluginName => {
  const plugin = plugins[pluginName];
  const descriptors = {};
  Object.keys(pluginApi).forEach(key => descriptors[key] = {
    enumerable: true,
    value: pluginApi[key].bind(null, plugin)
  });
  return Object.create(pluginApi, descriptors);
};

// ---- view execution (mirrors the old runViewContent) -----------------------

function runView(plugin, view) {
  try {
    if (plugin.html[view]) {
      Object.keys(plugin.html[view]).forEach(selector => {
        document.querySelector(selector).insertAdjacentHTML('beforeend', plugin.html[view][selector]);
      });
    }
    if (plugin.css[view]) $('#plugin-css').append(plugin.css[view]);
    if (plugin.js[view]) window.eval(plugin.js[view]);
  } catch (err) {
    post(TOAST, {text: `Plugin ${plugin.name} encountered an error`});
    console.error(`Execution for ${plugin.name} failed in ${view}: `, err);
  }
  post(RUN_DONE, {plugin: plugin.name, view});
}

// ---- message router --------------------------------------------------------

window.addEventListener('message', event => {
  if (event.source !== parent) return;
  const msg = event.data || {};
  switch (msg.type) {
    case SEED:
      window.stored = {themes: msg.themes, currentThemeIdx: msg.currentThemeIdx};
      if (msg.themeCss) $('#dynamic-colors').text(msg.themeCss);
      // The sections view is the base activity, exactly like the old main.js.
      activityStack.push(new Activity('New Tab', $('main.activity')[0]));
      break;
    case RUN:
      plugins[msg.plugin.name] = msg.plugin;
      runView(msg.plugin, msg.view);
      break;
    case ACTION_INVOKE: {
      const handler = actionHandlers.get(msg.uri);
      if (handler) handler();
      break;
    }
    case POP_REQUEST:
      pluginApi.popActivity();
      break;
    case NET_RESULT:
    case CACHE_RESULT: {
      const resolve = pending.get(msg.reqId);
      if (resolve) {
        pending.delete(msg.reqId);
        resolve(msg.type === CACHE_RESULT ? msg.value : {ok: msg.ok, status: msg.status, body: msg.body});
      }
      break;
    }
    default:
      break;
  }
});

// Announce readiness so the host can seed + run us.
post(SANDBOX_READY, {});
