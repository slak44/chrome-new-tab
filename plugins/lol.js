'use strict';
var plugin = {
  name: 'LoL Current Match',
  desc: 'Allows to check a player\'s current game information',
  author: 'Slak44',
  version: '0.1.0',
  preserveSettings: true,
  settings: [
    {
      name: 'Player Name',
      desc: 'Player to search for',
      type: 'text',
      value: '',
      isVisible: true
    },
    {
      name: 'Region',
      desc: 'What region to search in',
      type: 'text',
      value: '',
      isVisible: true
    },
    {
      name: 'Riot API Key',
      desc: 'API key to use in requests',
      type: 'text',
      value: '',
      isVisible: true
    },
    {
      name: 'Position',
      desc: 'The text will be inserted after this many elements',
      type: 'number',
      value: '',
      isVisible: true
    }
  ],
  main: function (plugin) {
    const DEBUG = false;
    const TEST_DATA_PATH = '';
    pluginCss.innerHTML += `
    #ingame-pane {
      opacity: 0;
    }
    #ingame-panel {
      justify-content: flex-end;
    }
    `;
    document.body.insertAdjacentHTML('beforeend', `
    <div id="ingame-pane" class="centered">
      <div class="row">
        <div class="col s3">
          <a id="ingame-back" class="bgcolor lighten-2 waves-effect waves-light btn"><i class="material-icons left">arrow_back</i>Back</a>
        </div>
      </div>
      <div class="row">
      </div>
    </div>
    `);
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
        getEventEmitter,
        getApiUtil,
        getDebugInfo,
        addDataToPane
      ], function (err) {
        if (err) throw err;
      });
    } else {
      async.waterfall([
        getEventEmitter,
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
    
    function getEventEmitter(callback) {
      let eventemitter2 = new XMLHttpRequest();
      eventemitter2.addEventListener('loadend', function () {
        if (eventemitter2.status === 200) {
          eval.apply(window, [eventemitter2.responseText]);
          callback(null);
        } else {
          callback(new Error(`Status code ${eventemitter2.status}`));
        }
      });
      eventemitter2.open('GET', 'https://raw.githubusercontent.com/asyncly/EventEmitter2/1.0.0/lib/eventemitter2.js');
      eventemitter2.send();
    }
    
    function getApiUtil(callback) {
      let apiUtil = new XMLHttpRequest();
      apiUtil.addEventListener('loadend', function () {
        window.ApiCaller = eval.apply(window, [apiUtil.responseText]);
        if (apiUtil.status === 200) {
          eval.apply(window, [apiUtil.responseText]);
          let apiCaller = new window.ApiCaller(
            [
              {requests: 10, time: 10, unit: 'seconds'},
              {requests: 500, time: 10, unit: 'minutes'}
            ],
            plugin.settings[2].value);
          callback(null, apiCaller);
        } else {
          callback(new Error(`Status code ${apiUtil.status}`));
        }
      });
      apiUtil.open('GET', 'https://gist.githubusercontent.com/slak44/45821e7257b72e27fbbe/raw/browserApiUtil.js');
      apiUtil.send();
    }
    
    function getPlayerData(apiCaller, callback) {
      apiCaller.getPlayerData(plugin.settings[1].value, plugin.settings[0].value, function (err, data) {
        if (err) {
          callback(err);
          return;
        }
        requests.playerByName = data;
        callback(null, apiCaller);
      });
    }
    
    function getCurrentGame(apiCaller, callback) {
      apiCaller.getCurrentGame(plugin.settings[1].value, requests.playerByName.id, function (err, data) {
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
        position: plugin.settings[3].value || 0,
        htmlContent:
        `<li class="collection-item">
          <h5>
            <a href="#" id="ingame-panel" class="valign-wrapper grey-text text-darken-4">
              <span class="color accent-4">${plugin.settings[0].value}</span>&nbsp;is ingame! <i class="material-icons valign">keyboard_arrow_right</i>
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
  }
};
/* jshint -W030*/
plugin;
