'use strict';
// let activeSchemeIndex = 0;

const defaultTheme = {
  name: 'Light Orange + Lime Accent',
  isDark: false,

  background: '#FAFAFA',
  main: '#FF9800',
  accent: '#B2FF59',
  selection: '#CCFF90',
  lighten: '#FFCC80',
  darken: '#EF6C00'
};

function activateTheme(theme) {
  const primaryTextColor = theme.isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.75)';
  byId('dynamic-colors').innerText = `
    input:focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {
      border-bottom-color: ${theme.main} !important;
      box-shadow: 0 1px 0 0 ${theme.main} !important;
    }
    input:focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {
      color: ${theme.main} !important;
    }
    [type="checkbox"]:checked + label:before {
      border-bottom-color: ${theme.main} !important;
      border-right-color: ${theme.main} !important;
    }
    .input-field i.prefix.active {color: ${theme.main} !important;}
    nav {background-color: ${theme.main} !important;}
    .text-primary {color: ${primaryTextColor} !important;}
    .waves-effect .waves-ripple {background-color: ${theme.isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.2);'} !important;}
    body {background-color: ${theme.background} !important;}
    .btn-floating {background-color: ${theme.accent} !important;}
    .btn-floating i {color: ${primaryTextColor} !important;}
    .tabs li.indicator {background-color: ${theme.accent} !important;}
    .tabs li a {color: ${primaryTextColor} !important;}
    .tabs li a.active {color: ${theme.accent} !important;}
    .collapsible > li {background-color: ${theme.isDark ? '#000000' : '#FFFFFF'} !important;}
    .selection {background-color: ${theme.selection} !important;}
    .switch label input[type=checkbox]:checked + .lever {background-color: ${theme.lighten} !important;}
    .switch label input[type=checkbox]:checked + .lever::after {background-color: ${theme.main} !important;}
  `;
}

function addThemeButton(theme, idx) {
  $('#themes').append(`
    <li class="waves-effect">
      <a href="#!" data-theme-idx="${idx}">
        ${theme.name}
        <i class="material-icons right scale-transition scale-out waves-effect">check</i>
      </a>
    </li>
  `);
  const anchor = $(`#themes [data-theme-idx="${idx}"]`);
  anchor.click(event => {
    $('#themes li.selection').removeClass('selection');
    anchor.parent().addClass('selection');
  });
  const selectThemeBtn = $(`#themes [data-theme-idx="${idx}"] i`);
  anchor.parent().hover(
    event => selectThemeBtn.addClass('scale-in'),
    event => selectThemeBtn.removeClass('scale-in')
  );
  selectThemeBtn.click(event => {
    $('#themes li.selection i.force-scale-in').removeClass('force-scale-in');
    selectThemeBtn.addClass('force-scale-in');
    activateTheme(theme);
    currentThemeIdx = idx;
    Materialize.toast($(`<span>Now using "${theme.name}"</span>`), SHORT_DURATION_MS);
    window.changesMade = true;
  });
}

// function saveSelected() {
//   // Switch the active one at the top
//   const originalScheme = colorSchemes[0];
//   colorSchemes[0] = colorSchemes[activeSchemeIndex];
//   colorSchemes[activeSchemeIndex] = originalScheme;
//   storage.store('colorSchemes');
//   window.location.reload();
// }
//
// function addFromFile() {
//   getFile((err, file, schemeText) => {
//     const scheme = JSON.parse(schemeText);
//     insertPreviewHTML(scheme);
//     addClickListener(byId('color-scheme-list').lastChild, byId('color-scheme-list').children.length - 1);
//     colorSchemes.push(scheme);
//     storage.store('colorSchemes');
//   });
// }
//
// function removeSelected() {
//   const activeSchemeName = colorSchemes[activeSchemeIndex].name;
//   if (!confirm(`Remove the scheme '${activeSchemeName}'?`)) return;
//   colorSchemes.splice(activeSchemeIndex, 1);
//   const schemeElement = byQSelect('#color-scheme-list > a.active');
//   schemeElement.parentNode.removeChild(schemeElement);
//   byId('color-scheme-list').children[0].classList.add('active');
//   storage.store('colorSchemes');
// }
//
// function insertPreviewHTML(scheme) {
//   const top = document.createElement('a');
//   top.href = '#!';
//   top.className = 'collection-item color';
//   top.innerText = scheme.name;
//
//   // Container for samples
//   const div = document.createElement('div');
//   div.className = 'row';
//   top.appendChild(div);
//
//   // Add scheme theme
//   div.appendChild(createColorSampleElement(scheme.isDark ? 'black' : 'white'));
//   // Add dark colors from darkest
//   addSamples(name => name.startsWith('darken'), (a, b) => (b > a ? 1 : -1));
//   // Add main color
//   div.appendChild(createColorSampleElement(scheme.main));
//   // Add light colors from darkest
//   addSamples(name => name.startsWith('lighten'));
//   // Add separator between the above and accent colors
//   div.insertAdjacentHTML('beforeend', '<br style="line-height: 75px;">');
//   // Add accent colors
//   addSamples(name => name.startsWith('accent'));
//
//   byId('color-scheme-list').appendChild(top);
//
//   function addSamples(filterFunction, sortFunction) {
//     Object.keys(scheme)
//       .filter(filterFunction)
//       .sort(sortFunction)
//       .forEach(colorName => {
//         div.appendChild(createColorSampleElement(scheme[colorName]));
//       });
//   }
//
//   function createColorSampleElement(color) {
//     const sample = document.createElement('div');
//     sample.style = `background-color: ${color};`;
//     sample.className = 'col s1 color-sample';
//     return sample;
//   }
// }
//
// function initSchemesEventListeners() {
//   Array.from(byId('color-scheme-list').children).forEach(addClickListener);
//   byId('color-scheme-list').children[0].classList.add('active');
// }
//
// function addClickListener(schemeElement, indexInParent) {
//   schemeElement.addEventListener('click', event => {
//     const actives = byQSelect('#color-scheme-list > a.active');
//     if (actives) actives.classList.remove('active');
//     schemeElement.classList.add('active');
//     activeSchemeIndex = indexInParent;
//   });
// }

module.exports = {
  defaultTheme,
  activateTheme,
  addThemeButton
  // insertPreviewHTML,
  // saveSelected,
  // addFromFile,
  // removeSelected,
  // initSchemesEventListeners
};
