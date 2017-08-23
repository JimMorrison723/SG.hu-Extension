import {port} from './messaging.js';

const defaultValues = {
	chatHide: false,
	custom_blocks: false,
	jump_unreaded_messages: false
};

export { database as db };
let database = {};

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
	console.log(database);
}

port.onMessage.addListener(function (event) {

	// Send back the settings object
	if (event.name === 'allSettings') {
		// Update dataStore with the new data
		loadOptions(event.message);
	}
});