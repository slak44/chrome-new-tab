var buttons = document.getElementsByClassName('button');
setDate();
setTime();
setButtonPos(10);

$(function(){
    $.getJSON('https://www.reddit.com/user/slak44/about.json?',
    function(data){
      document.getElementById('redditkarma').innerHTML =
      "Comment karma: " + data.data.comment_karma + "\n" +
      "Link karma: " + data.data.link_karma;
    });
});

function setButtonPos(buttonOffset) {
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
  document.getElementById("time").innerHTML = time;
  setTimeout(function(){setTime()}, 5000);
}

function setDate() {
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth();
  var year = d.getFullYear();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  var date = day + " " + getMonthName(month) + " " + year;
  document.getElementById("date").innerHTML = date;
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
