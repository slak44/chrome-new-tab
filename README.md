# ChromeNewTab

A chrome extension that replaces the new tab.

## Installation

Download `ext.crx` and `plugins.zip` from [here](https://github.com/slak44/ChromeNewTab/releases/latest).
Go to chrome://extensions in your browser, then drag `ext.crx` inside.
Navigate to the settings page to add buttons, plugins, and themes.

## Building the extension

Run `npm install` then `gulp all`, and the extension can be found packed in the `./build/dist` directory, or unpacked in the `./build/src` directory.

## Creating plugins

#### With the plugin bundler
- Run `npm init` in the plugin's folder and fill out the info
- Use `npm install --save` to add your dependencies
- Add the `html`, `css` and `js` sections to the `package.json` described below
- Optionally add the `babel` config
- Run the bundler (`node bundler.js`), the first argument being the plugin folder, and the second being a path where the compiled file should be placed

#### Using installed dependencies
After a dependency is eval'd, whatever it exports is placed in the dependency object of the plugin (`window.dependencies[pluginName]`), in a variable named after the package.  
For example, the dependency `hello`
```
'use strict';
exports.say = who => console.log(`Hello, ${who}!`);
```
can be used in plugin scripts like this:
```
let hello = window.dependencies[pluginName].hello;
hello.say('world');
```

#### List of views for inserting HTML/CSS
- `main`: the main page, the 'new tab'
- `secondary`: the extension's options page
- `global`: matches any view

#### List of positions for executing JS
All functions recieve the plugin's name as an argument (`pluginName`).
- `main`: after load of the main page. Executed after dependencies and globals
- `secondary`: after load of the extension's options page. Executed after dependencies and globals
- `global`: after dependencies are executed
- `init`: is executed on plugin install/update

#### Plugin `package.json` format:  
This file is used by `npm`, by `babel`, and by the bundler.  
Paths are relative to the `package.json`'s directory.
```
  {
    "pluginName": "displayName",
    "description": "message",
    "author": "name",
    "version": "1.1.1",
    "settings": [],
    "dependencies": {},
    "babel": {},
    "html": {
      "main": {
        "path/to/file1.html": "querySelector1",
        "path/to/file2.html": "querySelector2"
        ...
      },
      "secondary": {
        "path/to/file1.html": "querySelector1",
        "path/to/file2.html": "querySelector2"
        ...
      },
      "global": {
        "path/to/file1.html": "querySelector1",
        "path/to/file2.html": "querySelector2"
        ...
      }
    },
    "css": {
      "main": ["path/to/file1.css", "path/to/file2.css", ...],
      "secondary": ["path/to/file3.css", "path/to/file4.css", ...],
      "global": ["path/to/file5.css", "path/to/file6.css", ...]
    },
    "js": {
      "main": ["path/to/file1.js", "path/to/file2.js", ...],
      "secondary": ["path/to/file3.js", "path/to/file4.js", ...],
      "global": ["path/to/file5.js", "path/to/file6.js", ...],
      "init": ["path/to/file7.js", "path/to/file8.js", ...]
    }
  }
```
- `pluginName`: name of plugin
- `description`: plugin description.
- `author`: self-explanatory
- `version`: [semver](http://semver.org/) version string
- `settings`: array of objects, format described below. Setting values are preserved during updates only if the `name` and `type` properties are unchanged
- `dependencies`: npm's dependencies field
- `babel`: babel's config
- `html`: each property represents a view. For each view, there are html files associated with a query selector. The html will be inserted in the element obtained from the selector
- `css`: each property represents a view. The css files for each view are concatenated, and the merged data is appended to a stylesheet after the html has been inserted
- `js`: each property represents a position. Similar to the css files, all the js files are concatenated (in order of appearance), and the resulting script is executed at its respective position

## Implementation details

#### Theme format
Themes are just JSON files:
```
{
  "name": "Default Theme",
  "isDark": false,

  "background": "#FAFAFA",
  "main": "#FF9800",
  "accent": "#B2FF59",
  "selection": "#CCFF90",
  "lighten": "#FFCC80",
  "darken": "#EF6C00",

  "deleted": undefined
}
```
- `isDark`: (boolean) whether or not the theme should be considered "dark", as dark themes trigger light styles for some elements/text
- `deleted`: (optional boolean) if true, it signals that this theme was "deleted" by the user; this element will be *removed before saving* to storage


#### Plugin format:  
Usually, this is to be generated by the bundler from the `package.json` above.
This should be valid JSON.  
```
  {
    "name": "displayName",
    "desc": "message",
    "author": "name",
    "version": "1.1.1",
    "settings": [],
    "dependencyCode": "(function () {})()",
    "js": {
      "init": "(function () {})()",
      "global": "(function () {})()",
      "main": "(function () {})()",
      "secondary": "(function () {})()"
    },
    "css": {
      "main": "cssText",
      "secondary": "cssText",
    },
    "html": {
      "main": {
        "querySelector": "htmlToAdd"
        ...
      },
      "secondary": {
        "querySelector": "htmlToAdd"
        ...
      }
    },
    "deleted": undefined
  }
```
- `name`: see above, is equivalent to `pluginName`
- `desc`: see above, is equivalent to `description`
- `author`: see above
- `version`: see above
- `settings`: see above
- `dependencyCode`: a stringified IIFE, is eval'd before anything else. The bundler places all dependencies here
- `js`: all functions are stringified IIFEs, each property is a position
- `css`: the css from each property will be added to it's respective view
- `html`: every property targets a view. For every view, `htmlToAdd` will be added at the position specified by the `querySelector`. There can be multiple `querySelector`s
- `deleted`: (optional boolean) if true, it signals that this plugin was "deleted" by the user; this element will be *removed before saving* to storage

#### Setting format:
```
  {
    "name": "displayName",
    "desc": "message",
    "type": "type",
    "default": "",
    "value": undefined,
    "isVisible": true
  }
```
- `name`: (string) title of setting
- `desc`: (optional string) description of setting
- `type`: (enum string) [input types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
- `default`: (any) if the value is not set, this value should be used as a default
- `value`: (any) undefined until set
- `isVisible`: (boolean) if false, it means this 'setting' is just storage

#### Button format:
```
  {
    "kind": "default",
    "pictureType": "image",
    "imagePath": "http://example.com",
    "ligatureName": "",
    "href": "http://example.com",
    "text": "Button",
    "position": 3.14,
    "hotkey": "K",
    "openInNew": false,
    "deleted": undefined
  }
```
- `kind`: (enum string) what kind of "button" it is; values are `default`, `divider`, `subheader`
- `pictureType`: (enum string) if it is `image`, use the `imagePath`, if it is `icon` use `ligatureName`
- `imagePath`: (uri string) path to image
- `ligatureName`: (string) name of material icon
- `href`: (uri string) where does it point to
- `text`: (string) displyed text
- `position`: (float) used to determine order of buttons
- `hotkey`: (string) using alt+key triggers the button
- `openInNew`: (boolean) if true, opens the link in a new tab that replaces the current one
- `deleted`: (optional boolean) if true, it signals that this button was "deleted" by the user; this element will be *removed before saving* to storage

## reddit API
This API is used in [/plugins/reddit.js](https://github.com/slak44/ChromeNewTab/tree/master/plugins/reddit.js).  
The page will perform GET requests for the user data associated with the given username.
## License
[CC-BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
