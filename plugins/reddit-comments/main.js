'use strict';
const userName = api.setting('Reddit username');
const userUrl = `https://www.reddit.com/user/${userName}`;
const dataKey = 'redditApiLastCommentsKey';
const updateInterval = parseInt(api.setting('Data update period'), 10);
const itemCount = parseInt(api.setting('Item count'), 10);

const cached = JSON.parse(localStorage.getItem(dataKey));

const accentColor = stored.themes[stored.currentThemeIdx].accent;

const html = $.parseHTML(
  `<div id="overview-root">
    <h5>Latest from ${userName}</h5>
    <ol id="overview-list"></ol>
  </div>`
);

api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));

const upvoteColor = '#FF8964';
const downvoteColor = '#8C96FC';

function itemTemplate(element) {
  // This is from the reddit API, can't do anything about it
  /* eslint-disable camelcase */
  const {score, link_title, link_url, body, link_permalink, link_author, subreddit_name_prefixed} = element;
  const scoreColor = score > 0 ? upvoteColor : downvoteColor;
  const scoreStr = score > 0 ? `+${score}` : score;
  return `<li>
    <div class="line">
      <span>/${subreddit_name_prefixed}</span>
      <span class="text-divider"></span>
      <span>by /u/${link_author}</span>
      <span class="text-divider"></span>
      <a class="ellipsize grey-text" href="${link_url}">${link_title}</a>
    </div>
    <div class="line">
      <span style="color: ${scoreColor}">${scoreStr}</span>
      <span class="text-divider"></span>
      <span class="body-text ellipsize">${body.trim()}</span>
      <a href="${link_permalink}">
        <i class="material-icons">open_in_new</i>
      </a>
    </div>
  </li>`;
  /* eslint-enable camelcase */
}

function insertItems(data) {
  try {
    const html = Array.from(data.data.children)
      .map(t1Object => t1Object.data)
      .slice(0, itemCount)
      .reduce((previousValue, currentValue) => previousValue + itemTemplate(currentValue), '');
    const item = $('#overview-list')[0];
    item.innerHTML = '';
    item.insertAdjacentHTML('beforeend', html);
  } catch (err) {
    console.error(`Error building overview: ${err}`);
  }
}

setTimeout(function updateRedditOverview() {
  const cached = JSON.parse(localStorage.getItem(dataKey));
  if (cached !== null && Date.now() < cached.time + updateInterval) {
    // Cache fast path
    insertItems(cached.data);
    setTimeout(updateRedditOverview, updateInterval);
    return;
  }
  $.get(`${userUrl}/overview.json`, data => {
    insertItems(data);
    localStorage.setItem(dataKey, JSON.stringify({data, time: Date.now()}));
  }).done(() => setTimeout(updateRedditOverview, updateInterval));
}, 0);
