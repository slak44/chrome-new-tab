'use strict';

require('global');
const async = require('async');
const buttonsUtil = require('buttons');

// loadSchemes(() => {
//   activateScheme(colorSchemes[0]);
//
// });

async.parallel([loadButtons, loadPlugins], (err, results) => {
  if (err) throw err;
  plugins.forEach(plugin => runViewContent(plugin, 'main'));
});

let panels = [];
function addPanel(panelObject) {
  panels.push(panelObject);
  panels = panels.sort((a, b) => (a.position < b.position ? -1 : 1));
  const newPanelIndex = panels.indexOf(panelObject);
  const children = Array.from(byId('data-collection').children);
  if (children.length === 0) {
    byId('data-collection').insertAdjacentHTML('afterbegin', panelObject.htmlContent);
  } else if (panels.length - 1 === newPanelIndex) {
    byId('data-collection').insertAdjacentHTML('beforeend', panelObject.htmlContent);
  } else {
    children.forEach((child, i) => {
      if (newPanelIndex === i) child.insertAdjacentHTML('beforebegin', panelObject.htmlContent);
    });
  }
}

document.onkeydown = function (e) {
  if (e.altKey) window.location.replace(buttons.find(button => button.hotkey.charCodeAt() === e.keyCode).href);
};

// function createButton(options) {
//   if (options.parent && !(options.parent instanceof HTMLElement)) throw new Error('options.parent must be a HTMLElement');
//   const parent = options.parent || byId('buttons');
//   switch (options.kind) {
//     case 'divider': parent.insertAdjacentHTML('beforeend', '<li><div class="divider"></div></li>'); return;
//     case 'subheader': parent.insertAdjacentHTML('beforeend', `<li><a class="subheader">${options.text}</a></li>`); return;
//     default: break;
//   }
//   let picture = '';
//   switch (options.pictureType) {
//     case 'image': if (options.imagePath) picture = `<img src="${options.imagePath}" class="button-image"/>`; break;
//     case 'icon': if (options.ligatureName) picture = `<i class="material-icons">${options.ligatureName}</i>`; break;
//     default: picture = '';
//   }
//   parent.insertAdjacentHTML('beforeend', `
//   <li class="waves-effect">
// 		<a href="${options.href || ''}">
//       ${picture}
//       <span class="button-content">${options.text}</span>
// 		</a>
// 	</li>`);
//   const anchor = parent.children[parent.children.length - 1];
//   if (options.href !== undefined && (options.href.indexOf('chrome://') === 0 || options.openInNew))
//     anchor.addEventListener('click', event => {
//       chrome.tabs.create({url: options.href});
//       window.close();
//     });
//   return anchor;
// }

function loadButtons(callback) {
  storage.load('buttons', err => {
    if (err) {
      console.error(err);
      // FIXME replace with default value for buttons array
      // createButton({text: 'Configure buttons here', href: '/secondary/secondary.html'});
    } else {
      buttonsUtil.sorted().forEach(button => buttonsUtil.insertButton(button, $('#buttons')[0]));
      // const orderedButtons = [];
      // for (const i in buttons) orderedButtons.push(buttons[i]);
      // orderedButtons.sort((a, b) => {
      //   const [x, y] = [Number(a.position), Number(b.position)];
      //   if (x < y) return -1;
      //   else if (x > y) return 1;
      //   if (a.kind === 'divider') return -1;
      //   if (b.kind === 'divider') return 1;
      //   if (a.kind === 'subheader') return -1;
      //   if (b.kind === 'subheader') return 1;
      //   return (a.text < b.text) ? -1 : 1;
      // });
      // orderedButtons.forEach(e => createButton(e));
    }
    callback(null);
  });
}
