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
            'Comment karma: ' + data.data.comment_karma + '\n' +
            'Link karma: ' + data.data.link_karma;
        } else throw new Error('Failed request.');
      };
      req.onloadend = function () {
        setTimeout(updateRedditKarma, settings['Reddit request time'].value);
      };
      req.send();
    }
    pluginCss.innerHTML +=
    '#reddit-karma {\
      font-size: 30px;\
      top: 410px;\
      white-space: pre;\
     }';
    byId('data-pane').insertAdjacentHTML('beforeend', '<p id="reddit-karma" class="dpane-text global-text"></p>');
    setTimeout(updateRedditKarma, 0);
  }
};
plugin;
