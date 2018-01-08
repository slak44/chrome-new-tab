'use strict';
const html = $.parseHTML(`<h1>${api.setting('Title Text')}</h1>`);
api.insertView(html[0], api.setting('Order in section'), api.setting('Alignment'));
