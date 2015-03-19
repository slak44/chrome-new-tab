'use strict';
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
  byId("defaultPane").appendChild(createButton("assets/extensions.png", undefined, "Extensions"));

  byId("defaultPane").appendChild(createButton("assets/lol.png", undefined, "LoL Data"));

  setButtonPos(10);
  $(byId("Extensions")).click(function() {chrome.tabs.create({url:'chrome://extensions'});});

  addData("name", "Name", "p");
  addData("time", "00:00", "P");
  addData("date", "01 January 1970", "p");
  addData("redditkarma", "", "pre");
  byId("name").innerHTML = settings.name;
  updateRedditKarma();
  setDate();
  setTime();
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

/*Returns the element.*/
function createButton(imagePath, href, preText) {
  var link = document.createElement('a');
  var text = link.appendChild(document.createElement('pre'));
  //Set a link if there is one, make sure the cursor looks good if there isn't
  if (href !== undefined) link.href = href;
  else link.style.cursor = "pointer";
  link.id = preText;
  $(link).toggleClass("blockabsolute button");
  $(text).toggleClass("globalText buttonText");
  text.innerHTML = preText;
  link.style.backgroundImage = "url('"+imagePath+"'), url('assets/button.png')"
  return link;
}

/*Configures elements.*/
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
      byId('redditkarma').innerHTML =
      "Comment karma: "+data.data.comment_karma+"\n"+
      "Link karma: "+data.data.link_karma;
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
