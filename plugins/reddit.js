'use strict';
if (identity === 'Options page') {
  storage.addSetting({
    name: 'Reddit username',
    desc: 'Used to get karma information.',
    type: 'string',
    isVisible: true
  }, {update: false, definition: true});
  storage.addSetting({
    name: 'Reddit request time',
    desc: 'How frequent karma updates are.',
    type: 'number',
    isVisible: true
  }, {update: false, definition: true});
} else if (identity === 'Main page') {
  pluginCss.innerHTML +=
  '#reddit-karma {\
    font-size: 30px;\
    top: 410px;\
    white-space: pre;\
   }';
  byId('data-pane').insertAdjacentHTML('beforeend', '<p id="reddit-karma" class="dpane-text global-text"></p>');
  setTimeout(updateRedditKarma, 0);
}

function updateRedditKarma() {
  get('https://www.reddit.com/user/' + settings['Reddit username'].value + '/about.json?', function (data) {
    data = JSON.parse(data);
    byId('reddit-karma').innerHTML =
      'Comment karma: ' + data.data.comment_karma + '\n' +
      'Link karma: ' + data.data.link_karma;
  });
  setTimeout(updateRedditKarma, settings['Reddit request time'].value);
}
