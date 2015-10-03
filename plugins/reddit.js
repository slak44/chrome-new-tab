'use strict';
var plugin = {
  name: 'Reddit Karma',
  desc: 'Gets reddit karma from specified user',
  author: 'Slak44',
  version: '1.0',
  init: function () {
    storage.add('settings', {
      name: 'Reddit username',
      desc: 'Used to get karma information.',
      type: 'string',
      isVisible: true
    });
    storage.add('settings', {
      name: 'Reddit request time',
      desc: 'How frequent karma updates are.',
      type: 'number',
      isVisible: true
    });
  },
  main: function () {
    function updateRedditKarma() {
      var req = new XMLHttpRequest();
      req.open('GET', 'https://www.reddit.com/user/' + settings['Reddit username'].value + '/about.json?');
      req.onload = function () {
        if (req.status === 200) {
          var data = JSON.parse(req.response);
          byId('reddit-karma').innerHTML =
            'Comment karma: ' + data.data.comment_karma + '; Link karma: ' + data.data.link_karma;
        } else throw new Error('Failed request.');
      };
      req.onloadend = function () {
        setTimeout(updateRedditKarma, settings['Reddit request time'].value);
      };
      req.send();
    }
    byClass('bottom-text')[0].insertAdjacentHTML('beforeend', '<span id="reddit-karma"></span>');
    setTimeout(updateRedditKarma, 0);
  }
};
plugin;
