import { port } from './messaging.js';
import {extInit} from "../content/content";
import { defaultValues } from "./defaults"

export let database = {};

export function optionValues() {

	port.postMessage({name: "getSetting"});
}

function loadOptions(options) {

	for (let key in defaultValues) {

		if (options.hasOwnProperty(key))
			database[key] = options[key];
		else
			database[key] = defaultValues[key];
	}
	//console.log(database);
	extInit(database);
}

port.onMessage.addListener(function (event) {

	// Send back the settings object
	if (event.name === 'allSettings') {
		// Update dataStore with the new data
		loadOptions(event.message);
	}
});