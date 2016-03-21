'use strict';
let plugins = {};
let buttons = {};
let colorSchemes = [];

/* jshint -W057, -W061*/
const storage = new (function () {
  /*
    Plugin format:
      {
        name: 'displayName',
        desc: 'message',
        author: 'name',
        version: 'ver',
        preserveSettings: true, // TODO: check if settings have changed between versions and wipe them if so, disregarding this option
        settings: [],
        init: function () {},
        main: function (plugin) {},
        secondary: function () {}
      }
    name: what it is.
    desc: what it does.
    author: self-explanatory.
    version: self-explanatory.
    preserveSettings: whether or not settings should be preserved after plugin update. If the settings array has been modified in an update, this should be false
    settings: array of objects, format described below.
    These will be stored as strings:
    init: executed when the plugin is added.
    main: executed in the main page, is passed this plugin object.
    secondary: executed in the options page.
    
    Setting format:
      {
        name: 'displayName',
        desc: 'message',
        type: 'type',
        value: undefined,
        isVisible: true
      }
    name: title of setting.
    desc: description of setting.
    type: what kind of input tag is necessary. (number, text, checkbox, radiobox, etc)
    value: undefined until set.
    isVisible: if false, it means this 'setting' is just storage.
    
    Button format:
      {
        imagePath: 'path',
        href: 'ref',
        text: 'text',
        position: 0,
        hotkey: 'K',
        openInNew: false
      }
    imagePath: path to image.
    href: where does it point to.
    text: displyed text.
    position: used to determine order of buttons.
    hotkey: using alt+key triggers the button.
    openInNew: if true, opens the link in a new tab that replaces this one.
		
		Color Scheme format:
		{
			// Orange is default
			lighten5: '#fff3e0',
			lighten4: '#ffe0b2',
			lighten3: '#ffcc80',
			lighten2: '#ffb74d',
			lighten1: '#ffa726',
			main: 		'#ff9800',
			darken1: 	'#fb8c00',
			darken2: 	'#f57c00',
			darken3: 	'#ef6c00',
			darken4: 	'#e65100',
			accent1: 	'#ffd180',
			accent2: 	'#ffab40',
			accent3: 	'#ff9100',
			accent4: 	'#ff6d00',
			isDark: false
		}
  */
  
  const self = this;
  
  /*
    Constant.
    Existing storage elements. Usable as 'element' parameters for the other functions in this object.
  */
  this.stored = ['plugins', 'buttons', 'colorSchemes'];
  Object.freeze(this.stored);
  
  /*
    Checks whether or not an element is being stored in this object.
  */
  this.isStored = element => this.stored.includes(element);
  
  /*
    Private utility function that throws an error if the element is not in the `stored` array.
  */
  function throwIfNotStored(element) {
    if (!self.isStored(element)) throw new Error(`The element ${element} does not exist in this object`);
  }

  /*
    Load a stored element in a global object with the same name.
  */
  this.load = function (element, callback) {
    throwIfNotStored(element);
    chrome.storage.local.get(`stored${capitalize(element)}`, function (data) {
      window[element] = data[`stored${capitalize(element)}`];
      if (window[element] === undefined || window[element] === null) {
        callback(new Error(`No ${element} found.`));
        return;
      }
      callback(null);
    });
  };
  
  /*
    Stores an element in the browser storage.
    The name used for storage is 'stored' + the name of the element, capitalized.
    To store a new element, it must be first added to the `stored` array.
  */
  this.store = function (element, callback) {
    throwIfNotStored(element);
    eval(`chrome.storage.local.set({stored${capitalize(element)}: ${element}}, ${callback || 'undefined'})`);
  };

  /*
    Deletes all elements, both from their respective global objects and from the storage.
  */
  this.clearStorage = function () {
    this.stored.forEach(element => window[element] = null);
    chrome.storage.local.clear();
  };
  
  /*
    Only deletes a single element.
  */
  this.clear = function (element) {
    throwIfNotStored(element);
    window[element] = null;
    eval(`chrome.storage.local.set({stored${capitalize(element)}: {}}, undefined)`);
  };
})();

function activateScheme(scheme) {
  let css = `
  .color {color: ${scheme.main} !important;}
  .bgcolor {background-color: ${scheme.main} !important;}
  `;
  for (let i = 1; i <= 4; i++) {
    css +=
    `
    .color.darken-${i} {color: ${scheme[`darken${i}`]} !important;}
    .color.lighten-${i} {color: ${scheme[`lighten${i}`]} !important;}
    .color.accent-${i} {color: ${scheme[`accent${i}`]} !important;}
    
    .bgcolor.darken-${i} {background-color: ${scheme[`darken${i}`]} !important;}
    .bgcolor.lighten-${i} {background-color: ${scheme[`lighten${i}`]} !important;}
    .bgcolor.accent-${i} {background-color: ${scheme[`accent${i}`]} !important;}
    `;
  }
  // There are 5 light colors and 4 dark/accent
  css += `
  .color.lighten-5 {color: ${scheme.lighten5} !important;}
  .bgcolor.lighten-5 {background-color: ${scheme.lighten5} !important;}
  `;
  
	css += `
  input[type=text]:focus:not([readonly]), input[type=password]:focus:not([readonly]), input[type=email]:focus:not([readonly]), input[type=url]:focus:not([readonly]),
	input[type=time]:focus:not([readonly]), input[type=date]:focus:not([readonly]), input[type=datetime-local]:focus:not([readonly]), input[type=tel]:focus:not([readonly]),
	input[type=number]:focus:not([readonly]), input[type=search]:focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {
		border-bottom-color: ${scheme.main} !important;
		box-shadow: 0 1px 0 0 ${scheme.main} !important;
	}
  input[type=text]:focus:not([readonly]) + label, input[type=password]:focus:not([readonly]) + label, input[type=email]:focus:not([readonly]) + label,
	input[type=url]:focus:not([readonly]) + label, input[type=time]:focus:not([readonly]) + label, input[type=date]:focus:not([readonly]) + label,
	input[type=datetime-local]:focus:not([readonly]) + label, input[type=tel]:focus:not([readonly]) + label, input[type=number]:focus:not([readonly]) + label,
	input[type=search]:focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {
    color: ${scheme.main} !important;
  }
  
  [type="checkbox"]:checked + label:before {
    border-bottom-color: ${scheme.main} !important;
    border-right-color: ${scheme.main} !important;
  }
  
  .collection-item.active {background-color: ${scheme.darken4} !important;}
  `;
	
	if (scheme.isDark) {
    // TODO
	}
	
	byId('dynamic-colors').innerHTML = css;
}

function createButton(options) {
  if (options.parent === undefined || options.parent === null ||
      options.parent.insertAdjacentHTML === undefined) options.parent = byId('buttons');
	options.parent.insertAdjacentHTML('beforeend',
	`<li class="waves-effect waves-light collection-item">
		<a href="${options.href || ''}" class="button-link">
			<div class="valign-wrapper">
				<div class="button-image-wrapper">
          ${options.imagePath ?
            `<img src="${options.imagePath}"/>` :
            `<i class="material-icons">send</i>`}
        </div>
				<div class="valign thin button-text">${options.text}</div>
			</div>
		</a>
	</li>`
	);
  let anchor = options.parent.children[options.parent.children.length - 1];
  if (options.href !== undefined && (options.href.indexOf('chrome://') === 0 || options.openInNew))
    anchor.addEventListener('click', function (e) {chrome.tabs.create({url: options.href}); window.close();});
  return anchor;
}

function byId(id) {
  return document.getElementById(id);
}

function byClass(className) {
  return document.getElementsByClassName(className);
}

function byQSelect(selector) {
  return document.querySelector(selector);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substr(1);
}

function hasClass(element, className) {
  if (Array.from(element.classList).includes(className)) return true;
	else return false;
}

function toggleDiv(id, isElement) {
  if (!isElement) id = byId(id);
  if (hasClass(id, 'focused')) {
		id.classList.remove('focused');
    id.classList.add('unfocused');
  } else {
    id.classList.remove('unfocused');
    id.classList.add('focused');
  }
}

function loadSchemes(cb) {
	storage.load('colorSchemes', function (err) {
		if (err || colorSchemes[0] === undefined || colorSchemes[0] === null) {
			colorSchemes = [{
				// Orange is default
				lighten5: '#fff3e0',
				lighten4: '#ffe0b2',
				lighten3: '#ffcc80',
				lighten2: '#ffb74d',
				lighten1: '#ffa726',
				
				main: 		'#ff9800',
				
				darken1: 	'#fb8c00',
				darken2: 	'#f57c00',
				darken3: 	'#ef6c00',
				darken4: 	'#e65100',
				
				accent1: 	'#F4FF81',
				accent2: 	'#EEFF41',
				accent3: 	'#C6FF00',
				accent4: 	'#AEEA00',
				
				isDark: false,
				name: 'Light Orange, Lime Accents'
			}];
			storage.store('colorSchemes');
		}
		cb();
	});
}
