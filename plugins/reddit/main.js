'use strict';
const userUrl = `https://www.reddit.com/user/${api.setting('Reddit username')}`;
const dataKey = 'redditApiLastDataKey';
const updateInterval = parseInt(api.setting('Data update period'), 10);

const accentColor = stored.themes[stored.currentThemeIdx].accent;

// Network + cache are bridged to the host (the sandbox has a null origin and no
// localStorage), so this is async now; render once the initial cache is read.
(async () => {
  const cached = JSON.parse(await api.cacheGet(dataKey));
  const initialData = {
    commentKarma: cached === null ? '?' : cached.commentKarma,
    linkKarma: cached === null ? '?' : cached.linkKarma,
  };

  const html = $.parseHTML(
    `<h5>
      <a id="comment-karma" href="${userUrl}" style="color: ${accentColor}">${initialData.commentKarma}</a> comment karma
      <br>
      <a id="link-karma" href="${userUrl}" style="color: ${accentColor}">${initialData.linkKarma}</a> link karma
    </h5>`
  );

  api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));

  async function updateRedditKarma() {
    const cached = JSON.parse(await api.cacheGet(dataKey));
    if (cached !== null && Date.now() < cached.time + updateInterval) {
      // Cache fast path
      $('#comment-karma').text(cached.commentKarma);
      $('#link-karma').text(cached.linkKarma);
      setTimeout(updateRedditKarma, updateInterval);
      return;
    }
    let commentKarma;
    let linkKarma;
    try {
      const data = await api.get(`${userUrl}/about.json`);
      commentKarma = data.data.comment_karma;
      linkKarma = data.data.link_karma;
    } catch (err) {
      console.error(`Error getting karma ${err}`);
      commentKarma = '?';
      linkKarma = '?';
    }
    api.cacheSet(dataKey, JSON.stringify({commentKarma, linkKarma, time: Date.now()}));
    $('#comment-karma').text(commentKarma);
    $('#link-karma').text(linkKarma);
    setTimeout(updateRedditKarma, updateInterval);
  }
  updateRedditKarma();
})();
