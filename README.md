ChromeNewTab
============

A chrome extension that replaces the new tab.  
## Plugins
Plugins are `eval`'d both in the options page, and in the main page. Use the `identity` variable to detect where it is executed, and run code based on that.
## Riot API
This API is used in the [/plugins/lol.js](https://github.com/slak44/ChromeNewTab/blob/master/plugins/lol.js) file.
### Statement
This extension isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.  
### API Key
In order to use the LoL functionality, a valid Riot API key must be provided in the settings page.
### League data
The button will not work if the GET request returned with 503(server at capacity; wait) or 429(rate limit reached, too many requests; wait). Effectively any other response than 200(obviously) will cause the button to not function.
## reddit API
This API is used in the [/plugins/reddit.js](https://github.com/slak44/ChromeNewTab/tree/master/plugins/reddit.js) file.  
The page will perform GET requests for the user data associated with the given username.
## License
[CC-BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
