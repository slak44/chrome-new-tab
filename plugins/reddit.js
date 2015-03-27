'use strict';
if (identity === "Options page") {
  new Setting("Please input your reddit username:", "Reddit username");
} else if (identity === "Main page") {
  addData("redditkarma", "", "pre", "30px", "385px");
  byId("redditkarma").style.whiteSpace = "pre";
  setTimeout(updateRedditKarma, 0);
  appendHTML(document.body, '<img src="assets/empty30x30.png" id="persistentIsOnline" class="blockabsolute" width="30" height="30" style="right: 0px;"></img>')
}

/*
Updates the on-screen karma every 2.5s by requesting reddit data.
Connection indicator relies on this method(and reddit's servers..).
*/
function updateRedditKarma() {
  $.getJSON('https://www.reddit.com/user/'+settings["Reddit username"].value+'/about.json?',
    function(data) {
      byId('redditkarma').innerHTML =
      "Comment karma: "+data.data.comment_karma+"\n"+
      "Link karma: "+data.data.link_karma;
      if (byId("persistentIsOnline").src != "assets/empty30x30.png")
        byId("persistentIsOnline").src = "assets/empty30x30.png";
  }).error(function() {byId("persistentIsOnline").src = "assets/noconnection.png"});
  setTimeout(updateRedditKarma, 2500);
}
