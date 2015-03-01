function manipulateDOM() {
  byId("dataPane").style.left = ($(window).width()/2) - 400 + "px";
  byId("dataPane").style.top = "0px";
  byId("persistentIsOnline").style.right = "0px";

  byId("defaultPane").appendChild(createButton("assets/gmail.png", "https://mail.google.com/mail/?authuser=0", "Gmail"));
  byId("defaultPane").appendChild(createButton("assets/youtube.png", "https://www.youtube.com/?gl=RO&authuser=0", "Youtube"));
  byId("defaultPane").appendChild(createButton("assets/translate.png", "https://translate.google.com/?hl=en&authuser=0", "Translate"));
  byId("defaultPane").appendChild(createButton("assets/reddit.png", "https://www.reddit.com", "Reddit"));
  byId("defaultPane").appendChild(createButton("assets/lolnexus.png", "http://www.lolnexus.com/EUNE/search?name=slak44&region=EUNE", "LoLNexus"));
  byId("defaultPane").appendChild(createButton("assets/github.png", "https://github.com/", "GitHub"));
  byId("defaultPane").appendChild(createButton("assets/lol.png", "javascript:;", "LoL Data"));
  setButtonPos(10);

  addData("name", "Name", "p");
  addData("time", "00:00", "P");
  addData("date", "01 January 1970", "p");
  addData("redditkarma", undefined, "pre");
  byId("name").innerHTML = settings.name;
  updateRedditKarma();
  setDate();
  setTime();

  addTabPre("player", "Player: NAME (pid PID)");
  addTabPre("matchMap", "Map: MAP_NAME");
  addTabPre("matchEnv", "Match type: MATCH_MODE MATCH_TYPE");
  addTabPre("matchQueue", "Queue: QUEUE_TYPE");
  addTabPre("matchDuration", "Match time: MINUTES SECONDS");
  addTabPre("matchVer", "Match version: SEASON.PATCH.INFO1.INFO2");
  addTabPre("matchVictor", "Winner: TEAM");
  setBlockAbsolute();
  byId("matchHistoryPane").appendChild(createButton("assets/back.png", "javascript:;", "Go Back"));
}

/*Directly add to the DOM.*/
function addData(id, content, element) {
  var e = document.createElement(element);
  e.innerHTML = content;
  e.id = id;
  e.style.textAlign = "center";
  e.style.width = "800px";
  $(e).toggleClass("blockabsolute globalText");
  byId("dataPane").appendChild(e);
}
function addTabPre(id, content) {
  var pre = document.createElement("pre");
  pre.innerHTML = content;
  pre.id = id;
  $(pre).toggleClass("globalText infoText");
  byId("matchHistoryPane").appendChild(pre);
}

/*Returns the element.*/
function createButton(imagePath, href, preText) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  link.href = href;
  link.id = preText;
  $(link).toggleClass("blockabsolute button");
  $(text).toggleClass("globalText buttonText");
  text.innerHTML = preText;
  link.style.backgroundImage = "url('"+imagePath+"'), url('assets/button.png')"
  return link;
}

/*Configures elements.*/
function setBlockAbsolute() {
  var children = byId("matchHistoryPane").children;
  for (var i = 0; i < children.length; i++) $(children[i]).toggleClass("blockabsolute");
}
function setButtonPos(buttonOffset) {
  var buttons = document.getElementsByClassName('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.top = i * (50/*Button height*/ + buttonOffset/*Space between btns*/) + "px";
  }
}
function setTime() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if (m < 10) m = "0" + m;
  if (h < 10) h = "0" + h;
  var time = h + ":" + m;
  byId("time").innerHTML = time;
  setTimeout(setTime, 5000);
}
function setDate() {
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth();
  var year = d.getFullYear();
  if (day < 10) day = "0" + day;
  var date = day + " " + getMonthName(month) + " " + year;
  byId("date").innerHTML = date;
}

/*
Updates the on-screen karma every 7.5s by requesting reddit data.
Connection indicator relies on this method.
*/
function updateRedditKarma() {
  $.getJSON('https://www.reddit.com/user/'+settings.redditUser+'/about.json?',
    function(data){
      redditKarma = "Comment karma: " + data.data.comment_karma + "\n" +
      "Link karma: " + data.data.link_karma;
      byId('redditkarma').innerHTML = redditKarma;
      byId("persistentIsOnline").src = "assets/empty30x30.png";
  }).error(function() {byId("persistentIsOnline").src = "assets/noconnection.png"});
  setTimeout(updateRedditKarma, 7500);
}

/*Wrapper.*/
function byId(id) {
  return document.getElementById(id);
}

/*Move divs around.*/
function moveDiv(side/*Left=true or right=false*/, id) {
  if (side) {
    byId(id).style.left = "0px";
    byId(id).className = "";
    $("#"+id).toggleClass("goLeft");
  } else {
    byId(id).style.left = -$(window).width() + "px";
    byId(id).className = "";
    $("#"+id).toggleClass("goRight");
  }
}

/*Displays the match history div. Is called if/when the match data is stored.*/
function displayMatch() {
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

  byId("player").innerHTML = "Player: "+settings.player+" (pid "+settings.playerId+")";
  byId("matchMap").innerHTML = "Map: "+getMapName(match.mapId);
  byId("matchEnv").innerHTML =
    "Match type: "+getMatchMode(match.matchMode)+" "+getMatchType(match.matchType);
  byId("matchQueue").innerHTML = "Match queue: "+getQueueType(match.queueType);
  byId("matchDuration").innerHTML = "Match time: "+getHumanTime(match.matchDuration);
  byId("matchVer").innerHTML = "Match version: "+match.matchVersion;
  byId("matchVictor").innerHTML = "Winner: "+getWinner();
}
