'use strict';
var info = {
  idMap: {}
};
var matchId, match;

new Setting("server", "Please input your League of Legends server:", "Server");
new Setting("apiKey", "Please input a Riot API key:", "Api Key");
new Setting("player", "Please input your League of Legends summoner name:", "Summoner name");

onSettingsLoad.push(getLastMatchId);
settingsConfig.push(getPlayerIdByName);
mainButtons["LoL Data"] = new Button("assets/lol.png", undefined, "LoL Data");

/*Called in config.*/
function getPlayerIdByName(callback) {
  if (settings.playerId == undefined)
  get(
    "https://global.api.pvp.net/api/lol/"+settings.server+"/v1.4/summoner/by-name/"+settings.player+"?api_key="+settings.apiKey,
    function(data) {
      settings.playerId = JSON.parse(data)[settings.player.toLowerCase()].id;
      storeSettings();
      callback();
    }
  );
  else callback();
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
      var div = document.createElement("div"); div.id = "matchHistoryPane";
      div.style.visibility = "hidden";
      div.style.position = "absolute";
      document.body.appendChild(div);
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

/*DOM additions.*/
function addTabPre(id, content) {
  var pre = document.createElement("pre");
  pre.innerHTML = content;
  pre.id = id;
  pre.style.margin = "0px";
  pre.style.padding = "2.5px";
  pre.style.paddingLeft = "5px";
  $(pre).toggleClass("globalText infoText");
  byId("matchHistoryPane").appendChild(pre);
}
function setBlockAbsolute() {
  var children = byId("matchHistoryPane").children;
  for (var i = 0; i < children.length; i++) $(children[i]).toggleClass("blockabsolute");
}
/*Displays the match history div. Is called if/when the match data is stored.*/
function displayMatch() {
  byId("matchHistoryPane").appendChild(new Button("assets/back.png", undefined, "Go Back").aHref);
  setTabFields();
  var tableWidth = $(window).width() - 5/*Right padding*/;
  createTable(tableWidth);
  addPlayers(tableWidth);
}
/*Sets the style of a 'td'.*/
function setTableCellStyle(tableCell/*The HTML object*/, side/*Player color*/, nr/*Position in participants array*/, size/*Space from one of the sides*/) {
  var align, color;
  if (side == "RED") {
    align = "right";
    color = "#FFAAAA";
    tableCell.style.right = size + "px";
    tableCell.style.backgroundPosition = "right";
  } else {
    align = "left";
    color = "#AAAAFF"
    tableCell.style.left = size + "px";
    tableCell.style.backgroundPosition = "left";
  }
  tableCell.style.backgroundRepeat = "no-repeat";
  tableCell.style.backgroundSize = "20px 20px";
  tableCell.style.display = "block";
  tableCell.style.position = "absolute";
  tableCell.style.textAlign = align;
  tableCell.style.color = color;
  tableCell.style.top = (nr * (20/*Font size, px*/+2/*Offset between texts*/)) + "px";
  tableCell.style.width = "200px";
}
/*Adds the players and their data to the table.*/
function addPlayers(width) {
  var playerNames = getPlayerNames();
  var playerScores = getPlayerScores();
  for (var i = 0; i < 5; i++) {
    var newRow = document.createElement('tr');
    $(newRow).toggleClass("blockabsolute");
    newRow.style.width = width;

    var pa = document.createElement('td');
    var paScore = document.createElement('td');
    var pbScore = document.createElement('td');
    var pb = document.createElement('td');

    pa.innerHTML = playerNames[i];
    paScore.innerHTML = playerScores[i];
    pbScore.innerHTML = playerScores[i+5];
    pb.innerHTML = playerNames[i+5];

    var scoreOffset = 5/*Base padding*/+400/*Size of name*/+5/*Padding from name*/;
    setTableCellStyle(pa, "RED", i, 5);
    setTableCellStyle(paScore, "RED", i, scoreOffset);
    setTableCellStyle(pbScore, "BLUE", i, scoreOffset);
    setTableCellStyle(pb, "BLUE", i, 5);

    pa.style.backgroundImage = "url("+getImageUrl(i)+")";
    pa.style.paddingRight = "25px";

    pb.style.backgroundImage = "url("+getImageUrl(i+5)+")";
    pb.style.paddingLeft = "25px";

    newRow.appendChild(pa);
    newRow.appendChild(paScore);
    newRow.appendChild(pbScore);
    newRow.appendChild(pb);
    byId("players").appendChild(newRow);
  }
}
/*Configures the table.*/
function createTable(width) {
  var table = document.createElement("table");
  $(table).toggleClass("blockabsolute");
  table.id = "players";
  table.style.top = "330px";
  table.style.left = "0px";
  table.style.fontFamily = "Courier New";
  table.style.fontSize = "20px";
  table.style.fontWeight = "bold";
  table.style.whiteSpace = "nowrap";

  var row1 = document.createElement('tr');
  row1.style.width = width;
  $(row1).toggleClass("blockabsolute");
  var red = document.createElement('td');
  var blue = document.createElement('td');
  setTableCellStyle(red, "RED", undefined, 5);
  setTableCellStyle(blue, "BLUE", undefined, 5);
  red.style.top = "-25px";
  blue.style.top = "-25px";
  red.innerHTML = "Red team";
  blue.innerHTML = "Blue team";
  row1.appendChild(blue);
  row1.appendChild(red);
  table.appendChild(row1);
  byId("matchHistoryPane").appendChild(table);
}
/*Sets the match history tab's info fields.*/
function setTabFields() {
  var fields = document.getElementsByClassName("infoText");
  for (var i = 0; i < fields.length; i++)
    fields[i].style.top = (i * (20/*font size, px*/+10/*offset between texts*/) + 50/*button(id="reverse")*/) + "px";

  addTabPre("player", "Player: "+settings.player+" (pid "+settings.playerId+")");
  byId("player").style.marginTop = "70px";
  addTabPre("matchMap", "Map: "+getMapName(match.mapId));
  addTabPre("matchEnv", "Match type: "+getMatchMode(match.matchMode)+" "+getMatchType(match.matchType));
  addTabPre("matchQueue", "Queue: "+getQueueType(match.queueType));
  addTabPre("matchDuration", "Duration: "+getHumanTime(match.matchDuration));
  addTabPre("matchVer", "Version: "+match.matchVersion);
  addTabPre("matchVictor", "Winner: "+getWinner());
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
