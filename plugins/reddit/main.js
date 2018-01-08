'use strict';
const userUrl = `https://www.reddit.com/user/${api.setting('Reddit username')}`;

const html = $.parseHTML(
  `<h5>
    <a id="comment-karma" href="${userUrl}" style="color: ${themes[currentThemeIdx].accent}">?</a> comment karma
    <br>
    <a id="link-karma" href="${userUrl}" style="color: ${themes[currentThemeIdx].accent}">?</a> link karma
  </h5>`
);

api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));

setTimeout(function updateRedditKarma() {
  $.get(`${userUrl}/about.json`, (data, textStatus, jqXHR) => {
    let commentKarma;
    let linkKarma;
    try {
      commentKarma = data.data.comment_karma;
      linkKarma = data.data.link_karma;
    } catch (err) {
      console.error(`Error getting karma ${err}`);
      commentKarma = '?';
      linkKarma = '?';
    }
    $('#comment-karma').text(commentKarma);
    $('#link-karma').text(linkKarma);
  }).done(() => setTimeout(updateRedditKarma, api.setting('Data update period')));
}, 0);
