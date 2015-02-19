/*This code isn't endorsed by Riot Games and doesn't reflect
the views or opinions of Riot Games or anyone officially involved
in producing or managing League of Legends. League of Legends and
Riot Games are trademarks or registered trademarks of
Riot Games, Inc. League of Legends © Riot Games, Inc. */
var matchId, match;
var settings = {};
checkSettings();

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

function getLastMatchId() {
  main();
  $.get('https://eune.api.pvp.net/api/lol/'+settings.server+'/v2.2/matchhistory/'+settings.playerId+'?api_key='+settings.apiKey,
    function(data){
      matchId = data.matches[data.matches.length-1].matchId;
      getLastMatch();
  });
}

function getAndStorePlayerId(onFinish) {
  $.get(
    "https://eune.api.pvp.net/api/lol/"+settings.server+"/v1.4/summoner/by-name/"+settings.player+"?api_key="+settings.apiKey,
    function(data) {settings.playerId = data[settings.player.toLowerCase()].id;onFinish();}
    );
}

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

function getLastMatch() {
  $.get('https://eune.api.pvp.net/api/lol/'+settings.server+'/v2.2/match/'+matchId+'?api_key='+settings.apiKey,
    function(data){
      match = data;
      displayMatch();
      $(byId("LoL Data")).click(function() {
        byId("matchHistoryPane").style.visibility = "visible";
        hideLolPane(false);
        hideMainPane(true);
      });
      $("#reverse").click(function() {
        hideLolPane(true);
        hideMainPane(false);
      });
  });
}

function hideLolPane(boolean) {
  if (boolean) {
    byId("matchHistoryPane").style.left = "0px";
    byId("matchHistoryPane").className = "";
    $("#matchHistoryPane").toggleClass("goLeft");
  } else {
    byId("matchHistoryPane").style.left = -$(window).width() + "px";
    byId("matchHistoryPane").className = "";
    $("#matchHistoryPane").toggleClass("goRight");
  }
}

function displayMatch() {
  var fields = document.getElementsByClassName("infoText");
  for (var i = 0; i < fields.length; i++)
    fields[i].style.top = (i * (20/*font size, px*/+10/*offset between texts*/) + 50/*button(id="reverse")*/) + "px";

  byId("player").innerHTML = "Player: "+settings.player+" (pid "+settings.playerId+")";
  byId("matchMap").innerHTML = "Map: "+getMapName(match.mapId);
  byId("matchEnv").innerHTML =
    "Match type: "+getMatchMode(match.matchMode)+" "+getMatchType(match.matchType);
  byId("matchQueue").innerHTML = "Match queue: "+getQueueType(match.queueType);
  byId("matchDuration").innerHTML = "Match time: "+getHumanTime(match.matchDuration);
  byId("matchVer").innerHTML = "Match version: "+match.matchVersion;
  byId("matchVictor").innerHTML = "Winner: "+getWinner();

  var tableWidth = $(window).width() - 5/*Right padding*/ - 450/*Info offset*/;
  byId("header").style.width = tableWidth;
  var playerNames = getPlayerNames();
  var playerScores = getPlayerScores();

  for (var i = 0; i < 5; i++) {
    var newRow = document.createElement('tr');
    newRow.style.display = "block";
    newRow.style.position = "absolute";
    newRow.style.width = tableWidth;

    var pa = document.createElement('td');
    var paScore = document.createElement('td');
    var pbScore = document.createElement('td');
    var pb = document.createElement('td');

    pa.innerHTML = playerNames[i];
    paScore.innerHTML = playerScores[i];
    pbScore.innerHTML = playerScores[i+5];
    pb.innerHTML = playerNames[i+5];

    var scoreOffset = 5/*Base padding*/+200/*Size of name*/+5/*Padding from name*/;
    setTableCellStyle(pa, "RED", i, 5);
    setTableCellStyle(paScore, "RED", i, scoreOffset);
    setTableCellStyle(pbScore, "BLUE", i, scoreOffset);
    setTableCellStyle(pb, "BLUE", i, 5);

    newRow.appendChild(pa);
    newRow.appendChild(paScore);
    newRow.appendChild(pbScore);
    newRow.appendChild(pb);
    byId("players").appendChild(newRow);
  }
}

function setTableCellStyle(tableCell/*The HTML object*/, side/*Player color*/, nr/*What row is it on*/, size/*Space from one of the sides*/) {
  var align, color;
  if (side == "RED") {
    align = "right";
    color = "#FFAAAA";
    tableCell.style.right = size + "px";
  } else {
    tableCell.style.left = size + "px";
    align = "left";
    color = "#AAAAFF"
  }
  tableCell.style.display = "block";
  tableCell.style.position = "absolute";
  tableCell.style.textAlign = align;
  tableCell.style.color = color;
  tableCell.style.top = (nr * (20/*Font size, px*/+2/*Offset between texts*/)) + "px";
  tableCell.style.width = "200px";
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
