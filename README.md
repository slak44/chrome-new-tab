ChromeNewTab
============

A chrome extension that replaces the new tab.  

Plugin format:
```
  {
    name: 'displayName',
    desc: 'message',
    author: 'name',
    version: 'ver',
    preserveSettings: true,
    settings: [],
    dependencyCode: '(function () {})()',
    js: {
      init: '(function () {})()',
      global: '(function () {})()',
      main: '(function () {})()',
      secondary: '(function () {})()'
    },
    css: {
      main: 'cssText',
      secondary: 'cssText',
    },
    html: {
      main: {
        "querySelector": "htmlToAdd"
        ...
      },
      secondary: {
        "querySelector": "htmlToAdd"
        ...
      }
    }
  }
```
- `name`: what it is
- `desc`: what it does
- `author`: self-explanatory
- `version`: self-explanatory
- `preserveSettings`: whether or not settings should be preserved after plugin update. If the settings array has been modified in an update, this should be false
- `settings`: array of objects, format described below
- `dependencyCode`: a stringified IIFE, is eval'd before the `js.global` function below

The following objects also have `global` properties. They are executed/added on every page.
- `js`: all functions are stringified IIFEs
  - `init`: executed when the plugin is added
  - `main`: executed in the main page, is passed this plugin object
  - `secondary`: executed in the options page
- `css`: the css from each property will be added to it's respective view
- `html`: every property targets a view. For every view, `htmlToAdd` will be added at the position specified by the `querySelector`. There can be multiple `querySelector`s

Setting format:
```
  {
    name: 'displayName',
    desc: 'message',
    type: 'type',
    value: undefined,
    isVisible: true
  }
```
- `name`: title of setting
- `desc`: description of setting
- `type`: what kind of input tag is necessary. (number, text, checkbox, radiobox, etc)
- `value`: undefined until set
- `isVisible`: if false, it means this 'setting' is just storage

Button format:
```
  {
    imagePath: 'path',
    href: 'ref',
    text: 'text',
    position: 0,
    hotkey: 'K',
    openInNew: false
  }
```
- `imagePath`: path to image
- `href`: where does it point to
- `text`: displyed text
- `position`: used to determine order of buttons
- `hotkey`: using alt+key triggers the button
- `openInNew`: if true, opens the link in a new tab that replaces this one

Color Scheme format:
```
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
```

## reddit API
This API is used in [/plugins/reddit.js](https://github.com/slak44/ChromeNewTab/tree/master/plugins/reddit.js).  
The page will perform GET requests for the user data associated with the given username.
## License
[CC-BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
