/*This code isn't endorsed by Riot Games and doesn't reflect
the views or opinions of Riot Games or anyone officially involved
in producing or managing League of Legends. League of Legends and
Riot Games are trademarks or registered trademarks of
Riot Games, Inc. League of Legends © Riot Games, Inc. */
var matchId, match;

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
  setTabFields();
  var tableWidth = $(window).width() - 5/*Right padding*/ - 450/*Info offset*/;
  createTable(tableWidth);
  addPlayers(tableWidth);
}

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

function createTable(width) {
  var table = document.createElement("table");
  $(table).toggleClass("blockabsolute");
  table.id = "players";
  table.style.top = "88px";
  table.style.left = "450px";
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

function setTabFields() {
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
