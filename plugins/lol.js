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
    setTimeout(function () {
      let eventemitter2 = new XMLHttpRequest();
      eventemitter2.onload = function () {
        eval.apply(window, [eventemitter2.responseText]);
        getApiUtil();
      };
      eventemitter2.open('GET', 'https://raw.githubusercontent.com/asyncly/EventEmitter2/1.0.0/lib/eventemitter2.js');
      eventemitter2.send();
    }, 0);
    function getApiUtil() {
      let apiUtil = new XMLHttpRequest();
      apiUtil.onload = function () {
        window.ApiCaller = eval.apply(window, [apiUtil.responseText]);
        checkPlayer(new window.ApiCaller(
          [
            {"requests": 10, "time": 10, "unit": "second"},
            {"requests": 500, "time": 10, "unit": "minutes"}
          ],
          plugin.settings[2].value));
      };
      apiUtil.open('GET', 'https://gist.githubusercontent.com/slak44/45821e7257b72e27fbbe/raw/browserApiUtil.js');
      apiUtil.send();
    }
    function checkPlayer(apiCaller) {
      apiCaller.getPlayerData(plugin.settings[1].value, plugin.settings[0].value, function (err, data) {
        if (err) throw err;
        apiCaller.getCurrentGame(plugin.settings[1].value, data.id, function (err, cgData) {
          if (err) {
            if (err.toString().includes('404')) console.info('Player not ingame.');
            else throw err;
            return;
          }
          addInfoPanel();
        });
      });
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
