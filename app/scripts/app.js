import 'chromereload/devonly'

var dom = require('./content/dom.js');
import { port } from './utils/messaging';

import { test } from './settings/test.js';
import { optionValues } from "./utils/options";
import { extInit } from "./content/content";

optionValues();
test();

/*port.onMessage.addListener(function (event) {

	if (event.name === 'allSettings') {

		optionValues(event.message);

		// Add domready event
		extInit();

	} else if (event.name === 'updateDataStore') {

		// Update dataStore with the new data
		dataStore = event.message;
	}
});*/