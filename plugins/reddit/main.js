'use strict';
const userUrl = `https://www.reddit.com/user/${api.setting('Reddit username')}`;
const dataKey = 'redditApiLastDataKey';
const updateInterval = parseInt(api.setting('Data update period'), 10);

const cached = JSON.parse(localStorage.getItem(dataKey));
const initialData = {
  commentKarma: cached === null ? '?' : cached.commentKarma,
  linkKarma: cached === null ? '?' : cached.linkKarma,
};

const accentColor = stored.themes[stored.currentThemeIdx].accent;

const html = $.parseHTML(
  `<h5>
    <a id="comment-karma" href="${userUrl}" style="color: ${accentColor}">${initialData.commentKarma}</a> comment karma
    <br>
    <a id="link-karma" href="${userUrl}" style="color: ${accentColor}">${initialData.linkKarma}</a> link karma
  </h5>`
);

api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));

setTimeout(function updateRedditKarma() {
  const cached = JSON.parse(localStorage.getItem(dataKey));
  if (cached !== null && Date.now() < cached.time + updateInterval) {
    // Cache fast path
    $('#comment-karma').text(cached.commentKarma);
    $('#link-karma').text(cached.linkKarma);
    setTimeout(updateRedditKarma, updateInterval);
    return;
  }
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
    localStorage.setItem(dataKey, JSON.stringify({commentKarma, linkKarma, time: Date.now()}));
    $('#comment-karma').text(commentKarma);
    $('#link-karma').text(linkKarma);
  }).done(() => setTimeout(updateRedditKarma, updateInterval));
}, 0);
