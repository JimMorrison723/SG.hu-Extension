import 'chromereload/devonly'
// import { optionValues } from './utils/options';
//import { database } from "./utils/database"
/*import { port } from './utils/messaging';*/
//optionValues();

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(({name, key, val} = event) => {

		// For development only!
		//chrome.storage.sync.clear();
		switch (name) {
			case 'getSetting':
				return chrome.storage.sync.get(null, function (items) {
					port.postMessage({name: "allSettings", message: items});
				});
			case 'setSetting':
				let save = {};
				save[key] = val;
				return chrome.storage.sync.set(save);
			case 'allSettings':
				console.log('all');
				return;
		}
	});
});

/*chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log(key, namespace,	storageChange.oldValue,	storageChange.newValue);
	}
});*/