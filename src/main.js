function main() {
  byId("dataPane").style.left = ($(window).width()/2) - 400 + "px";
  byId("dataPane").style.top = "0px";
  byId("name").innerHTML = settings.name;
  byId("persistentIsOnline").style.right = "0px";
  setBlockAbsolute();
  setButtonPos(10);
  setDate();
  setTime();
  updateRedditKarma();
}

function byId(id) {
  return document.getElementById(id);
}

function setBlockAbsolute() {
  var children = byId("matchHistoryPane").children;
  for (var i = 0; i < children.length; i++) $(children[i]).toggleClass("blockabsolute");
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

function setButtonPos(buttonOffset) {
  var buttons = document.getElementsByClassName('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.top = i * (50 + buttonOffset/*space between btns*/) + "px";
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
