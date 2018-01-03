'use strict';

function addButtonCard(config, idx) {
  const hasImg = config.imagePath && config.imagePath !== '';
  $('#buttons-tab').append(`
  <div class="card horizontal" data-button-idx="${idx}">
    <div class="card-image">
      <div class="card-missing-image ${hasImg ? 'hidden' : ''}">
        <i class="material-icons medium">cloud_off</i>
        <p>No Image</p>
      </div>
      <img class="${hasImg ? '' : 'hidden'}" src="${config.imagePath}">
    </div>
    <div class="card-stacked">
      <div class="card-content">
        <div class="input-field">
          <input name="text" type="text" value="${config.text}">
          <label for="text" class="active">Button Text</label>
        </div>
        <div class="input-field">
          <input name="url" type="url" value="${config.href}">
          <label for="url" class="active">Target URL</label>
        </div>
        <div class="input-field">
          <input name="img" type="url" value="${config.imagePath}">
          <label for="img" class="active">Image URL</label>
        </div>
        <div class="input-field">
          <input name="position" type="number" value=${config.position}>
          <label for="position" class="active">Button Position</label>
        </div>
        <div class="input-field">
          <input name="hotkey" class="capitalized" type="text" maxlength="1" value="${config.hotkey}">
          <label for="hotkey" class="active">Hotkey (alt+key)</label>
        </div>
      </div>
      <div class="card-action">
        <a href="#!" class="remove-action">Remove</a>
      </div>
    </div>
  </div>
  `);
  const card = $(`.card[data-button-idx="${idx}"]`);
  card.find('.remove-action').click(event => {
    buttons[idx].deleted = true;
    card.addClass('hidden');
    window.changesMade = true;
    // FIXME show snack with undo
  });
  ['text', 'url', 'hotkey'].forEach(propName => {
    card.find(`input[name="${propName}"]`).blur(event => {
      if (!event.target.value) return;
      buttons[idx][propName] = event.target.value;
      window.changesMade = true;
    });
  });
  card.find('input[name="position"]').blur(event => {
    if (!event.target.value) return;
    buttons[idx].position = parseInt(event.target.value, 10);
    window.changesMade = true;
  });
  card.find('input[name="img"]').blur(event => {
    /* eslint-disable no-param-reassign */
    const image = card.find('img');
    const noImageDiv = card.find('.card-missing-image');
    if (event.target.dataset.lastUrl === event.target.value) {
      return;
    } else if (!event.target.value) {
      image.addClass('hidden');
      noImageDiv.removeClass('hidden');
      event.target.dataset.lastUrl = event.target.value;
      return;
    }
    event.target.dataset.lastUrl = event.target.value;
    buttons[idx].imagePath = event.target.value;
    window.changesMade = true;
    image.attr('src', event.target.value);
    noImageDiv.addClass('hidden');
    image.removeClass('hidden');
    /* eslint-enable no-param-reassign */
  });
}

$('#add-button').click(event => {
  buttons.push({
    text: '',
    href: '',
    imagePath: '',
    position: '',
    hotkey: '',
    openInNew: false
  });
  window.changesMade = true;
  addButtonCard(buttons[buttons.length - 1], buttons.length - 1);
  $(`.card[data-button-idx="${buttons.length - 1}"] input[name="text"]`).focus();
  Materialize.updateTextFields();
});

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
