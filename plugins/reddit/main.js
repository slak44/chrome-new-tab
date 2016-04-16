'use strict';
let url = `https://www.reddit.com/user/${plugins[pluginName].settings[0].value}`;
function updateRedditKarma() {
  let req = new XMLHttpRequest();
  req.open('GET', url + '/about.json');
  req.onload = function () {
    if (req.status === 200) {
      let data = JSON.parse(req.response);
      byId('reddit-karma').innerHTML =
        `<a href="${url}" class="color accent-4">${data.data.comment_karma}</a> comment karma
        <br>
        <a href="${url}" class="color accent-4">${data.data.link_karma}</a> link karma`;
    } else throw new Error('Failed request.');
  };
  req.onloadend = () => setTimeout(updateRedditKarma, plugins[pluginName].settings[1].value);
  req.send();
}
addPanel({
  position: plugins[pluginName].settings[2].value || 0,
  htmlContent:
  `<li class="collection-item">
    <h5 id="reddit-karma"></h5>
  </li>`
});
setTimeout(updateRedditKarma, 0);
