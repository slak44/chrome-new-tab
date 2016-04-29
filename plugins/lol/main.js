'use strict';
const DEBUG = false;
const TEST_DATA_PATH = '';

const httpStatusOk = 200;

const pluginDeps = window.dependencies[pluginName];
const async = pluginDeps.async;
window.EventEmitter2 = pluginDeps.eventemitter2;

document.body.addEventListener('click', function () {
  chrome.permissions.request({
    origins: ['https://*.pvp.net/*']
  }, function (granted) {
    if (!granted) alert('Cannot proceed without origin permissons.');
  });
});
let requests = {
  playerByName: null,
  currentGame: null,
  playerSummaries: [],
  playerLeagues: null
};
if (DEBUG) {
  async.waterfall([
    getApiUtil,
    getDebugInfo,
    addDataToPane
  ], function (err) {
    if (err) throw err;
  });
} else {
  async.waterfall([
    getApiUtil,
    getPlayerData,
    getCurrentGame,
    getParticipantSummaries,
    getParticipantLeagues,
    addDataToPane
  ], function (err) {
    if (err) throw err;
  });
}

function getDebugInfo(apiCaller, callback) {
  addInfoPanel();
  let testData = new XMLHttpRequest();
  testData.addEventListener('loadend', function () {
    let data = JSON.parse(testData.responseText);
    requests.playerByName = data['summoner-by-name'];
    requests.currentGame = data['current-game'];
    requests.playerSummaries = data['player-summaries'];
    callback(null, apiCaller);
  });
  testData.open('GET', TEST_DATA_PATH);
  testData.send();
}

function getApiUtil(callback) {
  let apiUtil = new XMLHttpRequest();
  apiUtil.addEventListener('loadend', function () {
    window.ApiCaller = eval.apply(window, [apiUtil.responseText]);
    if (apiUtil.status === httpStatusOk) {
      eval.apply(window, [apiUtil.responseText]);
      let apiCaller = new window.ApiCaller(
        [
          {requests: 10, time: 10, unit: 'seconds'},
          {requests: 500, time: 10, unit: 'minutes'}
        ],
        plugins[pluginName].settings[2].value);
      callback(null, apiCaller);
    } else {
      callback(new Error(`Status code ${apiUtil.status}`));
    }
  });
  apiUtil.open('GET', 'https://gist.githubusercontent.com/slak44/45821e7257b72e27fbbe/raw/browserApiUtil.js');
  apiUtil.send();
}

function getPlayerData(apiCaller, callback) {
  apiCaller.getPlayerData(plugins[pluginName].settings[1].value, plugins[pluginName].settings[0].value, function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    requests.playerByName = data;
    callback(null, apiCaller);
  });
}

function getCurrentGame(apiCaller, callback) {
  apiCaller.getCurrentGame(plugins[pluginName].settings[1].value, requests.playerByName.id, function (err, data) {
    if (err) {
      if (err.toString().includes('404')) callback(new Error('Player not ingame'));
      else callback(err);
      return;
    }
    requests.currentGame = data;
    addInfoPanel();
    callback(null, apiCaller);
  });
}

function getParticipantSummaries(apiCaller, callback) {
  // TODO
}

function getParticipantLeagues(apiCaller, callback) {
// TODO
}

function addDataToPane(apiCaller, callback) {
// TODO
}

function addInfoPanel() {
  addPanel({
    position: plugins[pluginName].settings[3].value || 0,
    htmlContent:
    `<li class="collection-item">
      <h5>
        <a href="#" id="ingame-panel" class="valign-wrapper grey-text text-darken-4">
          <span class="color accent-4">${plugins[pluginName].settings[0].value}</span>&nbsp;is ingame! <i class="material-icons valign">keyboard_arrow_right</i>
        </a>
      </h5>
    </li>`
  });
  function toggle(event) {
    event.preventDefault();
    toggleDiv('ingame-pane');
    toggleDiv('default-pane');
  }
  byId('ingame-back').addEventListener('click', toggle);
  byId('ingame-panel').addEventListener('click', toggle);
}
