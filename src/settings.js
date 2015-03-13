'use strict'
var
settings = {},
info = {
  idMap: {}
};
var matchId, match;
checkSettings();

/*Clear the storage.*/
function clear() {
  settings = {};
  chrome.storage.local.clear();
}

function get(url, res) {
    new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) resolve(req.response);
      else reject(Error(req.statusText));
    };
    req.send();
  }).then(res, function(err){console.log(err)});
}

function checkSettings() {
  new Promise(function(resolve, reject) {
    chrome.storage.local.get("storedSettings", function(data){
      settings = data.storedSettings;
      if (data.storedSettings == undefined) reject("Failed to load settings.");
      else resolve("Done fetching settings.");
    });
  }).then(
    function(res) {
      /*Settings present; load the data.*/
      console.log(res);
      setTimeout(manipulateDOM, 0);
      getLastMatchId();
    },
    function(err) {
      /*Settings not present; prompt for data, get playerId, store data, load the data.*/
      console.log(err);
      promptSettings();
      get(
        "https://global.api.pvp.net/api/lol/"+settings.server+"/v1.4/summoner/by-name/"+settings.player+"?api_key="+settings.apiKey,
        function(data) {
          settings.playerId = JSON.parse(data)[settings.player.toLowerCase()].id;
          setTimeout(manipulateDOM, 0);
          chrome.storage.local.set({"storedSettings": settings}, getLastMatchId);
        }
      );
    }

  );
}

function promptSettings() {
  settings = {};
  settings.name = prompt("Please input a title:");
  settings.redditUser = prompt("Please input your reddit username:");
  settings.server = prompt("Please input your League of Legends server:");
  settings.apiKey = prompt("Please input a Riot API key:");
  settings.player = prompt("Please input your League of Legends summoner name:");
}

/*Riot API GETs. In order of execution.*/
function getLastMatchId() {
  get(
    'https://global.api.pvp.net/api/lol/'+settings.server+'/v2.2/matchhistory/'+settings.playerId+'?api_key='+settings.apiKey,
    function(data) {
      var parsed = JSON.parse(data);
      matchId = parsed.matches[parsed.matches.length-1].matchId;
      getLastMatch();
    }
  );
}
function getLastMatch() {
  get(
    'https://global.api.pvp.net/api/lol/'+settings.server+'/v2.2/match/'+matchId+'?api_key='+settings.apiKey,
    function(data) {
      match = JSON.parse(data);
      getDataDragonInfo();
    }
  );
}
function getDataDragonInfo() {
  get(
    "http://ddragon.leagueoflegends.com/realms/"+settings.server+".json",
    function(data) {info.ddRealm = JSON.parse(data); getAllChampionData();}
  );
}
function getAllChampionData() {
  get(
    "https://global.api.pvp.net/api/lol/static-data/"+settings.server+"/v1.2/champion?champData=image&api_key="+settings.apiKey,
    function(data) {
      info.champions = JSON.parse(data);
      for (var i in info.champions.data) if (info.champions.data.hasOwnProperty(i)) info.idMap[info.champions.data[i].id] = i;
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
    }
  );
}

/*DATA PROCESSING -->*/

function getNameById(id) {
  for (var i in info.idMap) {
    if (i == id) return info.idMap[i];
  }
}

function getImageUrl(participantNr) {
  return "http://ddragon.leagueoflegends.com/cdn/"+info.ddRealm.dd+"/img/champion/"+
  info.champions.data[getNameById(match.participants[participantNr].championId)].image.full
}

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
  case "CLASSIC" : return "Classic";
  case "ARAM"    : return "Aram";
  case "ODIN"    : return "Dominion";
  case "TUTORIAL": return "Tutorial"
  default: return "Other gamemode";
  }
}

function getMatchType(rawType) {
  if (rawType === "MATCHED_GAME") return "matched game";
  else return "custom game";
}

function getQueueType(rawQueue) {
  switch (rawQueue) {
  case "GROUP_FINDER_5x5"  : return "TeamBuilder";
  case "NORMAL_5x5_BLIND"  : return "Normal blind";
  case "NORMAL_5x5_DRAFT"  : return "Normal draft";
  case "NORMAL_3x3"        : return "Normal 3v3";
  case "ODIN_5x5_BLIND"    : return "Dominion blind";
  case "ODIN_5x5_DRAFT"    : return "Dominon draft (ROFL WHO PLAYS THIS)";
  case "RANKED_SOLO_5x5"   : return "Ranked solo";
  case "RANKED_PREMADE_5x5": return "Ranked duo";
  case "RANKED_TEAM_5x5"   : return "Ranked team";
  case "RANKED_TEAM_3x3"   : return "Ranked 3v3 team";
  case "ARAM_5x5"          : return "ARAM";
  case "CUSTOM"            : return "Self-created match";
  default: return "Other gamemode";
  }
}

function getMapName(mapId) {
  switch (mapId) {
  case 11: return "Summoner's Rift";
  case 10: return "Twisted Treeline";
  case 12: return "Howling Abyss";
  case 08: return "The Crystal Scar";
  default: return "Other map";
  }
}

function getMonthName(monthNumeral) {
  switch (monthNumeral) {
  case  0: return "January";
  case  1: return "February";
  case  2: return "March";
  case  3: return "April";
  case  4: return "May";
  case  5: return "June";
  case  6: return "July";
  case  7: return "August";
  case  8: return "September";
  case  9: return "October";
  case 10: return "November";
  case 11: return "December";
  default: return "What did you do with this method?"
  }
}
