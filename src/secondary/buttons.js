'use strict';

function addButtonCard(config) {
  const hasImg = config.imagePath && config.imagePath !== '';
  $('buttons-tab').append(`
  <div class="card horizontal">
    <div class="card-image">
      <div class="card-missing-image ${hasImg ? 'hidden' : 'shown'}">
        <i class="material-icons medium">cloud_off</i>
        <p>No Image</p>
      </div>
      <img class="${hasImg ? 'shown' : 'hidden'}" src="${config.imagePath}">
    </div>
    <div class="card-stacked">
      <div class="card-content">
        <div class="input-field">
          <input name="btn-text" type="text" value="${config.text}">
          <label for="btn-text" class="active">Button Text</label>
        </div>
        <div class="input-field">
          <input name="btn-url" type="url" value="${config.href}">
          <label for="btn-url" class="active">Target URL</label>
        </div>
        <div class="input-field">
          <input name="btn-img" type="url" value="${config.imagePath}">
          <label for="btn-img" class="active">Image URL</label>
        </div>
        <div class="input-field">
          <input name="btn-order" type="number" value=${config.order}>
          <label for="btn-order" class="active">Button Order</label>
        </div>
        <div class="input-field">
          <input name="btn-hotkey" class="capitalized" type="text" maxlength="1" value="${config.hotkey}">
          <label for="btn-hotkey" class="active">Hotkey (alt+key)</label>
        </div>
      </div>
    </div>
  </div>
  `);
}

// function createNewButton() {
//   const id = prompt('Input a unique identifier for the button:');
//   if (id === null) return;
//   // We're adding the first button, so show the button config UI
//   if (Object.keys(buttons).length === 0) {
//     byId('button-config').dataset.buttonsExist = 'yes';
//   }
//   if (buttons[id] !== undefined && buttons[id] !== null) {
//     alert('Identifier already exists.');
//     return;
//   }
//   buttons[id] = {
//     text: '',
//     href: '',
//     imagePath: '',
//     hotkey: '',
//     order: '',
//     checked: false
//   };
//   setActiveButton(buttons[id], id);
//   byId('buttons-list').insertAdjacentHTML('beforeend', `
//   <li id="${id}">
//     <a href="#!">${id}</a>
//   </li>`
//   );
// }
//
// function removeButton() {
//   const id = byId('button-text').getAttribute('data-button-id');
//   if (!confirm(`Delete the button with id '${id}'?`)) return;
//   delete buttons[id];
//   byId(id).parentNode.removeChild(byId(id));
//   activateDefaultButton();
//   storage.store('buttons');
// }
//
// function saveFocusedButton(id) {
//   buttons[id] = {
//     text: byId('button-text').value,
//     href: byId('button-link').value,
//     imagePath: byId('button-image').value,
//     position: byId('button-position').value,
//     hotkey: byId('button-hotkey').value.toUpperCase(),
//     openInNew: Boolean(byId('button-replace-tab').checked)
//   };
//   storage.store('buttons');
// }
//
// function initDropdown() {
//   const dropdown = byId('buttons-list');
//   for (const id in buttons) {
//     dropdown.insertAdjacentHTML('beforeend',
//       `<li id="${id}">
//         <a href="#!">${id}</a>
//       </li>`
//     );
//     byId(id).addEventListener('click', event => setActiveButton(buttons[id], id));
//   }
// }
//
// function setActiveButton(buttonData, id) {
//   byId('button-name').innerText = id;
//   byId('button-text').setAttribute('data-button-id', id);
//   byId('button-text').value = buttonData.text;
//   byId('button-link').value = buttonData.href;
//   byId('button-image').value = buttonData.imagePath;
//   byId('button-position').value = buttonData.position;
//   byId('button-hotkey').value = buttonData.hotkey;
//   byId('button-replace-tab').checked = buttonData.openInNew;
// }
//
// function activateDefaultButton() {
//   const firstButtonId = Object.keys(buttons)[0];
//   if (firstButtonId !== undefined) setActiveButton(buttons[firstButtonId], firstButtonId);
// }

module.exports = {
  addButtonCard,
  // createNewButton,
  // removeButton,
  // initDropdown,
  // setActiveButton,
  // activateDefaultButton,
  // saveFocusedButton
};
