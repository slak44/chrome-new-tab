function main() {
  manipulateDOM();
  setDate();
  setTime();
  updateRedditKarma();
}

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
  addData("redditkarma", "", "pre");
  byId("name").innerHTML = settings.name;

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

function addData(id, content, element) {
  var e = document.createElement(element);
  e.innerHTML = content;
  e.id = id;
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

function setBlockAbsolute() {
  var children = byId("matchHistoryPane").children;
  for (var i = 0; i < children.length; i++) $(children[i]).toggleClass("blockabsolute");
}

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

function setButtonPos(buttonOffset) {
  var buttons = document.getElementsByClassName('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.top = i * (50/*Button height*/ + buttonOffset/*Space between btns*/) + "px";
  }
}

function byId(id) {
  return document.getElementById(id);
}

function hideMainPane(boolean) {
  if (boolean) {
    byId("defaultPane").style.left = "0px";
    byId("defaultPane").className = "";
    $("#defaultPane").toggleClass("goLeft");
  } else {
    byId("defaultPane").style.left = -$(window).width() + "px";
    byId("defaultPane").className = "";
    $("#defaultPane").toggleClass("goRight");
  }
}

function updateRedditKarma() {
  $.getJSON('https://www.reddit.com/user/'+settings.redditUser+'/about.json?',
    function(data){
      byId('redditkarma').innerHTML =
      "Comment karma: " + data.data.comment_karma + "\n" +
      "Link karma: " + data.data.link_karma;
      byId("persistentIsOnline").src = "assets/empty30x30.png";
  }).error(function() {byId("persistentIsOnline").src = "assets/noconnection.png"});
  setTimeout(updateRedditKarma, 7500);
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
