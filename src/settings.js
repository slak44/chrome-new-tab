var settings = {};
var matchId, match;
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
      /*Settings present; load the data.*/
      console.log(result);
      getLastMatchId();
    },
    function(err){
      /*Settings not present; prompt for data, get playerId, store data, load the data.*/
      console.log(err);
      promptSettings();
      getAndStorePlayerId(cacheSettings, getLastMatchId);
    }
  );
}

/*Clear the storage.*/
function clear() {
  settings = {};
  chrome.storage.local.clear();
}

function getAndStoreSettings(onFinish) {
  chrome.storage.local.get("name", function(data){settings.name = data.name;});
  chrome.storage.local.get("redditUser", function(data){settings.redditUser = data.redditUser;});
  chrome.storage.local.get("server", function(data){settings.server = data.server;});
  chrome.storage.local.get("apiKey", function(data){settings.apiKey = data.apiKey;});
  chrome.storage.local.get("player", function(data){settings.player = data.player;});
  chrome.storage.local.get("playerId", function(data){settings.playerId = data.playerId;onFinish();});
}

function promptSettings() {
  settings.name = prompt("Please input a title (4 letters are recommended):");
  settings.redditUser = prompt("Please input your reddit username:");
  settings.server = prompt("Please input your League of Legends server:");
  settings.apiKey = prompt("Please input a Riot API key:");
  settings.player = prompt("Please input your League of Legends summoner name:");
}

function getAndStorePlayerId(callback, innerCallback) {
  $.get(
    "https://eune.api.pvp.net/api/lol/"+settings.server+"/v1.4/summoner/by-name/"+settings.player+"?api_key="+settings.apiKey,
    function(data) {settings.playerId = data[settings.player.toLowerCase()].id; callback(innerCallback);}
    );
}

function cacheSettings(callback) {
  chrome.storage.local.set({"name": settings.name}, undefined);
  chrome.storage.local.set({"redditUser": settings.redditUser}, undefined);
  chrome.storage.local.set({"server": settings.server}, undefined);
  chrome.storage.local.set({"apiKey": settings.apiKey}, undefined);
  chrome.storage.local.set({"player": settings.player}, undefined);
  chrome.storage.local.set({"playerId": settings.playerId}, callback());
}

function getLastMatchId() {
  main();
  $.get('https://eune.api.pvp.net/api/lol/'+settings.server+'/v2.2/matchhistory/'+settings.playerId+'?api_key='+settings.apiKey,
    function(data){
      matchId = data.matches[data.matches.length-1].matchId;
      getLastMatch();
  });
}

function getLastMatch() {
  $.get('https://eune.api.pvp.net/api/lol/'+settings.server+'/v2.2/match/'+matchId+'?api_key='+settings.apiKey,
    function(data){
      match = data;
      displayMatch();
      $(byId("LoL Data")).click(function() {
        byId("matchHistoryPane").style.visibility = "visible";
        moveDiv(false, "matchHistoryPane");
        moveDiv(true, "defaultPane");
      });
      $(byId("Go Back")).click(function() {
        moveDiv(true, "matchHistoryPane");
        moveDiv(false, "defaultPane");
      });
  });
}

/*DATA PROCESSING -->*/

function getPlayerScores() {
  var scores = [];
  for (var i = 0; i < match.participants.length; i++) {
    var playerStats = match.participants[i].stats;
    scores[scores.length] = playerStats.kills + "/" + playerStats.deaths + "/" + playerStats.assists;
  }
  return scores;
}

function getPlayerNames() {
  var names = [];
  for (var i = 0; i < match.participantIdentities.length; i++) {
    names[names.length] = match.participantIdentities[i].player.summonerName;
  }
  return names;
}

function getWinner() {
  if (match.teams[0].winner == true) return "Red";
  else return "Blue";
}

function getHumanTime(seconds) {
  var mins = Math.floor(seconds/60);
  var sec = seconds-(mins*60);
  return mins+" minutes "+sec+" seconds";
}

function getMatchMode(rawMode) {
  switch (rawMode) {
  case "CLASSIC":
    return "Classic";
    break;
  case "ARAM":
    return "Aram";
    break;
  case "ODIN":
    return "Dominion";
    break;
  case "TUTORIAL":
    return "Tutorial"
    break;
  default:
    return "Featured gamemode";
  }
}

function getMatchType(rawType) {
  switch (rawType) {
  case "MATCHED_GAME":
    return "matched game";
    break;
  default:
    return "custom game";
  }
}

function getQueueType(rawQueue) {
  switch (rawQueue) {
  case "GROUP_FINDER_5x5":
    return "TeamBuilder";
    break;
  case "NORMAL_5x5_BLIND":
    return "Normal blind";
    break;
  case "NORMAL_5x5_DRAFT":
    return "Normal draft";
    break;
  case "NORMAL_3x3":
    return "Normal 3v3";
    break;
  case "ODIN_5x5_BLIND":
    return "Dominion blind";
    break;
  case "ODIN_5x5_DRAFT":
    return "Dominon draft (ROFL WHO PLAYS THIS)";
    break;
  case "RANKED_SOLO_5x5":
    return "Ranked solo";
    break;
  case "RANKED_PREMADE_5x5":
    return "Ranked duo";
    break;
  case "RANKED_TEAM_5x5":
    return "Ranked team";
    break;
  case "RANKED_TEAM_3x3":
    return "Ranked 3v3 team";
    break;
  case "ARAM_5x5":
    return "ARAM";
    break;
  case "CUSTOM":
    return "Self-created match";
    break;
  default:
    return "Featured gamemode";
  }
}

function getMapName(mapId) {
  switch (mapId) {
  case 11:
    return "Summoner's Rift";
    break;
  case 10:
    return "Twisted Treeline";
    break;
  case 12:
    return "Howling Abyss";
    break;
  case 8:
    return "The Crystal Scar";
    break;
  default:
    return "Other map";
  }
}

function getMonthName(monthnumeral) {
  switch (monthnumeral) {
  case 0:
    return "January";
    break;
  case 1:
    return "February";
    break;
  case 2:
    return "March";
    break;
  case 3:
    return "April";
    break;
  case 4:
    return "May";
    break;
  case 5:
    return "June";
    break;
  case 6:
    return "July";
    break;
  case 7:
    return "August";
    break;
  case 8:
    return "September";
    break;
  case 9:
    return "October";
    break;
  case 10:
    return "November";
    break;
  case 11:
    return "December";
    break;
  default: return "What did you do with this method?"
  }
}
