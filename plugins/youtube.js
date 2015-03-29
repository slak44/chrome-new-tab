'use strict';
if (identity === "Options page") {
  new Setting("", "youtube.js", "lastVideo", false);
} else if (identity === "Main page") {
  appendHTML(document.body, '<div id="youtubePane" class="blockabsolute"></div>');
  var goBack = new Button("assets/back.png", undefined, "Go Back");
  mainButtons["Watch Youtube"] = new Button("assets/youtube.png", undefined, "Watch Youtube");
  mainButtons["Watch Youtube"].setOnClick(addVideo);
}

function addVideo() {
  getUrl();
  moveDiv("Left", "defaultPane");
  moveDiv("Right", "youtubePane");
  appendHTML("youtubePane",
  '<iframe id="ytIframe" width="800" height="450" class="blockabsolute" '+
  'style="'+
  'left: '+(($(window).width()-800)/2)+'; top: '+(($(window).height()-450)/2)+';" '+
  'src="'+settings.lastVideo.value+'" frameborder="0" allowfullscreen></iframe>');
}

function getUrl() {
  if (settings.lastVideo.value === undefined) settings.lastVideo.value = prompt("Please input a link to a youtube video(note that some videos cannot be embedded):");
  var val = settings.lastVideo.value;
  if (val.includes("youtube.com/embed")) {
    storeSettings();
    return;
  }
  if (val.includes("youtube.com/watch?v=")) {
    var vidId = val.slice(val.indexOf("watch?v=")+8);
    vidId = vidId.slice(0, vidId.indexOf('&'));
    settings.lastVideo.value = "https://www.youtube.com/embed/"+vidId+"?fs=1";
    storeSettings();
  } else throw Error("Invalid url.");
}
