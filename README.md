ChromeNewTab
============

A chrome extension that replaces the new tab.  
## Plugins
Plugin object specification can be found [here](https://github.com/slak44/ChromeNewTab/blob/master/src/global.js).  
The plugins must 'return' their object to the `eval`. Make sure to package all necessary functions in `init`/`main`/`secondary` as they are the only ones stored.  
See the [plugins](https://github.com/slak44/ChromeNewTab/tree/master/plugins) folder for examples.
## reddit API
This API is used in [/plugins/reddit.js](https://github.com/slak44/ChromeNewTab/tree/master/plugins/reddit.js).  
The page will perform GET requests for the user data associated with the given username.
## License
[CC-BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
