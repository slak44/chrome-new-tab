'use strict';
const util = new PluginUtil(pluginName);
const httpStatusOk = 200;
const defaultUpdatePeriod = 7500;
const userUrl = `https://www.reddit.com/user/${util.getSetting('Reddit username')}`;
function updateRedditKarma() {
  const req = new XMLHttpRequest();
  req.open('GET', `${userUrl}/about.json`);
  req.onload = function () {
    if (req.status === httpStatusOk) {
      const data = JSON.parse(req.response);
      byId('reddit-karma').innerHTML =
        `<a href="${userUrl}" class="color accent-4">${data.data.comment_karma}</a> comment karma
        <br>
        <a href="${userUrl}" class="color accent-4">${data.data.link_karma}</a> link karma`;
    } else throw new Error('Failed request.');
  };
  req.onloadend = () => setTimeout(updateRedditKarma, util.getSetting('Data update period') || defaultUpdatePeriod);
  req.send();
}
addPanel({
  position: util.getSetting('Position') || 0,
  htmlContent:
  `<li class="collection-item">
    <h5 id="reddit-karma"></h5>
  </li>`
});
setTimeout(updateRedditKarma, 0);
