var settings = {};
checkSettings();

function checkSettings() {
  var storagePromise = new Promise(function(resolve, reject) {
    getAndStoreSettings(function() {
      if(settings.name != undefined &&
        settings.server != undefined &&
        settings.apiKey != undefined &&
        settings.player != undefined &&
        settings.playerId != undefined) resolve("Done fetching settings.");
      else reject(Error("Failed to load settings."));
    });
  });

  storagePromise.then(
    function(result) {
      console.log(result);
      getLastMatchId();
    },
    function(err){
      console.log(err);
      promptSettings(storeSettings);
    }
  );
}

function clear() {
  settings = {};
  chrome.storage.local.clear();
}

function storeSettings() {
  chrome.storage.local.set({"name": settings.name}, undefined);
  chrome.storage.local.set({"redditUser": settings.redditUser}, undefined);
  chrome.storage.local.set({"server": settings.server}, undefined);
  chrome.storage.local.set({"apiKey": settings.apiKey}, undefined);
  chrome.storage.local.set({"player": settings.player}, undefined);
  chrome.storage.local.set({"playerId": settings.playerId}, getLastMatchId());
}

function getAndStoreSettings(onFinish) {
  chrome.storage.local.get("name", function(data){settings.name = data.name;});
  chrome.storage.local.get("redditUser", function(data){settings.redditUser = data.redditUser;});
  chrome.storage.local.get("server", function(data){settings.server = data.server;});
  chrome.storage.local.get("apiKey", function(data){settings.apiKey = data.apiKey;});
  chrome.storage.local.get("player", function(data){settings.player = data.player;});
  chrome.storage.local.get("playerId", function(data){settings.playerId = data.playerId;onFinish();});
}

function promptSettings(onFinish) {
  settings.name = prompt("Please input a title (4 letters are recommended):");
  settings.redditUser = prompt("Please input your reddit username:");
  settings.server = prompt("Please input your League of Legends server:");
  settings.apiKey = prompt("Please input a Riot API key:");
  settings.player = prompt("Please input your League of Legends summoner name:");
  getAndStorePlayerId(onFinish);
}
