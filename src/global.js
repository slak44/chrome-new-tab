'use strict';
var plugins = {};
var buttons = {};
var colorScheme = [];

/* jshint -W057, -W061*/
var storage = new (function () {
  /*
    Existing storage objects. Usable as 'what' parameters.
    
    Plugin format:
      {
        name: 'displayName',
        desc: 'message',
        author: 'name',
        version: 'ver',
        settings: [],
        init: function () {},
        main: function () {},
        secondary: function () {}
      }
    name: what it is.
    desc: what it does.
    author: self-explanatory.
    version: self-explanatory.
    settings: array of objects, format described below.
    These will be stored as strings:
    init: executed when the plugin is added.
    main: executed in the main page.
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
  this.stored = ['plugins', 'buttons', 'colorScheme'];

  this.load = function (what, onLoadEnd) {
    chrome.storage.local.get('stored' + capitalize(what), function (data) {
      window[what] = data['stored' + capitalize(what)];
      // Make sure there's something there
      if (window[what] === undefined || window[what] === null || window[what] === {} || window[what] === []) {
        onLoadEnd(new Error('No ' + what + ' found.'));
        return;
      }
      console.log('Done loading ' + what + '.');
      onLoadEnd();
    });
  };
  
  this.add = function (what, toAdd) {
    window[what] = (window[what])? window[what] : {};
    if (toAdd === undefined || toAdd === null || typeof toAdd !== 'object') throw new Error('Invalid argument: ' + toAdd);
    window[what][toAdd.name] = toAdd;
    this.store(what);
  };
  
  this.remove = function (what, name) {
    delete window[what][name];
    this.store(what);
  };
  
  this.store = function (what) {
    eval('chrome.storage.local.set({stored' + capitalize(what) + ': ' + what + '}, undefined)');
  };

  /*
    Wipes all storage, both in-memory and persistent.
  */
  this.clearStorage = function () {
    for (var i = 0; i < storage.stored.length; i++) eval(storage.stored[i] + ' = {}');
    chrome.storage.local.clear();
  };
  
  this.clear = function (what) {
    window[what] = {};
    eval('chrome.storage.local.set({stored' + capitalize(what) + ': {}}, undefined)');
  };
})();

function activateScheme(scheme) {
  /* jshint -W004 */
  var css = '.bgcolor {background-color: ' + scheme.main + ' !important;}';
	for (var i = 1; i <= 4; i++) css += '\n.bgcolor.darken-' + i +' {background-color: ' + scheme['darken' + i] + ' !important;}';
	for (var i = 1; i <= 5; i++) css += '\n.bgcolor.lighten-' + i +' {background-color: ' + scheme['lighten' + i] + ' !important;}';
	for (var i = 1; i <= 4; i++) css += '\n.bgcolor.accent-' + i +' {background-color: ' + scheme['accent' + i] + ' !important;}';
	
	css += '.color {color: ' + scheme.main + ' !important;}';
	for (var i = 1; i <= 4; i++) css += '\n.color.darken-' + i +' {color: ' + scheme['darken' + i] + ' !important;}';
	for (var i = 1; i <= 5; i++) css += '\n.color.lighten-' + i +' {color: ' + scheme['lighten' + i] + ' !important;}';
	for (var i = 1; i <= 4; i++) css += '\n.color.accent-' + i +' {color: ' + scheme['accent' + i] + ' !important;}';
	
	css += '\n.collection-item.active {background-color: ' + scheme.darken4 + ' !important;}';
	
	css += '\ninput[type=text]:focus:not([readonly]), input[type=password]:focus:not([readonly]), input[type=email]:focus:not([readonly]), input[type=url]:focus:not([readonly]),' +
	'input[type=time]:focus:not([readonly]), input[type=date]:focus:not([readonly]), input[type=datetime-local]:focus:not([readonly]), input[type=tel]:focus:not([readonly]),' +
	'input[type=number]:focus:not([readonly]), input[type=search]:focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {' +
	'	border-bottom-color: ' + scheme.main + ' !important;' +
	'	box-shadow: 0 1px 0 0 ' + scheme.main + ' !important;' +
	'}';
	css += '\ninput[type=text]:focus:not([readonly]) + label, input[type=password]:focus:not([readonly]) + label, input[type=email]:focus:not([readonly]) + label,' +
	'input[type=url]:focus:not([readonly]) + label, input[type=time]:focus:not([readonly]) + label, input[type=date]:focus:not([readonly]) + label,' +
	'input[type=datetime-local]:focus:not([readonly]) + label, input[type=tel]:focus:not([readonly]) + label, input[type=number]:focus:not([readonly]) + label,' +
	'input[type=search]:focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {' +
	'color: ' + scheme.main + ' !important;}';
	css += '\n[type="checkbox"]:checked + label:before {border-bottom-color: ' + scheme.main + ' !important; border-right-color: ' + scheme.main + ' !important;}';
	
	if (scheme.isDark) {
    // TODO
	}
	
	byId('dynamic-colors').innerHTML = css;
}

function createButton(options) {
  if (options.parent === undefined || options.parent === null ||
      options.parent.insertAdjacentHTML === undefined) options.parent = byId('buttons');
	var image = options.imagePath ? '<img src="' + options.imagePath + '"/>' : '<i class="material-icons">send</i>';
	options.parent.insertAdjacentHTML('beforeend',
	'<li class="waves-effect waves-light collection-item">' +
		'<a href="'+(options.href || '')+'" class="button-link">' +
			'<div class="valign-wrapper">' +
				'<div class="button-image-wrapper">'+image+'</div>' +
				'<div class="valign thin button-text">'+options.text+'</div>' +
			'</div>' +
		'</a>' +
	'</li>'
	);
  var anchor = options.parent.children[options.parent.children.length - 1];
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
  if (Array.prototype.indexOf.apply(element.classList, [className]) > -1) return true;
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
	storage.load('colorScheme', function (err) {
		if (err) {
			colorScheme = [{
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
				
				isDark: false,
				name: 'Light Orange'
			}];
			storage.store('colorScheme');
		}
		cb();
	});
}
