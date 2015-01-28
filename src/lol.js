//This code isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
//League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
var apiKey = , playerId = 27080204;
var matchId, match;
getLastMatchId();

function getLastMatchId() {
  $.get('https://eune.api.pvp.net/api/lol/eune/v2.2/matchhistory/'+playerId+'?api_key='+apiKey,
    function(data){
      matchId = data.matches[data.matches.length-1].matchId;
      getLastMatch();
  });
}

function getLastMatch() {
  $.get('https://eune.api.pvp.net/api/lol/eune/v2.2/match/'+matchId+'?api_key='+apiKey,
    function(data){
      match = data;
      displayMatch();
      $("#match").click(function() {
        document.getElementById("matchHistoryPane").style.visibility = "visible";
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
    document.getElementById("matchHistoryPane").style.left = "0px";
    document.getElementById("matchHistoryPane").className = "";
    $("#matchHistoryPane").toggleClass("goLeft");
  } else {
    document.getElementById("matchHistoryPane").style.left = "-1600px";
    document.getElementById("matchHistoryPane").className = "";
    $("#matchHistoryPane").toggleClass("goRight");
  }
}
//TODO also display players with game stats
//TODO hover on player for data
//TODO highlighted info in stats

//TODO compressed stats/smaller font&offset?
//TODO jquery ui?
//TODO background for whole div?
//TODO stupid stat counts(total wards per player ex)?
//TODO player search?
function displayMatch() {
  var fields = document.getElementsByClassName("infoText");
  for (var i = 0; i < fields.length; i++) {
    fields[i].style.top = (i * (20/*font size, px*/+10/*offset between texts*/) + 50/*button(id="reverse")*/) + "px";
  }
  document.getElementById("matchMap").innerHTML = "Map: "+getMapName(match.mapId);
  document.getElementById("matchEnv").innerHTML =
    "Match type: "+getMatchMode(match.matchMode)+" "+getMatchType(match.matchType);
  document.getElementById("matchQueue").innerHTML = "Match queue: "+getQueueType(match.queueType);
  document.getElementById("matchDuration").innerHTML = "Match time: "+getHumanTime(match.matchDuration);
  document.getElementById("matchVer").innerHTML = "Match version: "+match.matchVersion;
  document.getElementById("matchVictor").innerHTML = "Winner: "+getWinner();

  document.getElementById("header").style.width = screen.width - 5;
  var playerNames = getPlayerNames();
  for (var i = 0; i < 5; i++) {
    var newRow = document.createElement('tr');
    newRow.style.display = "block";
    newRow.style.position = "absolute";
    newRow.style.width = screen.width - 5;
    var pa = document.createElement('td');
    var pb = document.createElement('td');
    pa.innerHTML = playerNames[i];
    pb.innerHTML = playerNames[i+5];
    setTableCellStyle(pa, "RED", i);
    setTableCellStyle(pb, "BLUE", i);
    newRow.appendChild(pa);
    newRow.appendChild(pb);
    document.getElementById("players").appendChild(newRow);
  }
}

function setTableCellStyle(tableCell, side, nr) {
  var align, color;
  if (side == "RED") {
    align = "right";
    color = "#FFAAAA";
    tableCell.style.right = "5px";
  } else {
    tableCell.style.left = "5px";
    align = "left";
    color = "#AAAAFF"
  }
  tableCell.style.display = "block";
  tableCell.style.position = "absolute";
  tableCell.style.textAlign = align;
  tableCell.style.color = color;
  tableCell.style.top = (nr * (20/*font size, px*/+2/*offset between texts*/)) + "px";
}

/*DATA PROCESSING -->*/

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
