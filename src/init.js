'use strict';
var onSettingsLoad = [];
var settingsConfig = [];
var mainButtons = {
  "Gmail":      new Button("assets/gmail.png", "https://mail.google.com/mail/?authuser=0", "Gmail"),
  "Youtube":    new Button("assets/youtube.png", "https://www.youtube.com/?gl=RO&authuser=0", "Youtube"),
  "Translate":  new Button("assets/translate.png", "https://translate.google.com/?hl=en&authuser=0", "Translate"),
  "Reddit":     new Button("assets/reddit.png", "https://www.reddit.com", "Reddit"),
  "GitHub":     new Button("assets/github.png", "https://github.com/", "GitHub"),
  "LoLNexus":   new Button("assets/lolnexus.png", "http://www.lolnexus.com/EUNE/search?name=slak44&region=EUNE", "LoLNexus"),
  "Extensions": new Button("assets/extensions.png", undefined, "Extensions")
};
