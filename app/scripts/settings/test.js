import 'chromereload/devonly'
import { port } from '../utils/messaging.js';

export function test() {
	port.postMessage({name: "setSetting",  key: 'test', val: 'testVal'});
	port.postMessage({name: "setSetting",  key: 'chatHide', val: false });
	//port.postMessage({name: "getSetting"});
}
/*
port.onMessage.addListener(function (event) {

	if (event.name === 'setSettings') {

		console.log(event);

	} else if (event.name === 'allSettings') {

		// Update dataStore with the new data
		console.log(event);

	} else if (event.name === 'updateDataStore') {

		// Update dataStore with the new data
		database = event.message;
		console.log(dataStore);
	}
});*/