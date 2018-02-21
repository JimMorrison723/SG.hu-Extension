import browser from './util/browser'
let defaultSettings = require('./util/defaultSettings')

browser.extension.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (event) {

		let list, index;

		// Send back the settings object
		if (event.name === 'getSettings') {

			let gettingItem = browser.storage.sync.get(null, function (item) {
				port.postMessage({ name: "setSettings", message: item })
			})

			// Add user to blocklist
		} else if (event.name === 'addToBlocklist') {

			// If theres in no entry in localStorage
			if (typeof localStorage['block_list'] === "undefined") {
				localStorage['block_list'] = '';
			}

			// If the blocklist is empty
			if (localStorage['block_list'] === '') {
				localStorage['block_list'] = event.message;
				port.postMessage({ name: "updateDataStore", message: localStorage });

				// If the blocklist is not empty
			} else {
				var blockList = localStorage['block_list'].split(',');
				if (blockList.indexOf(event.message) === -1) {
					blockList.push(event.message);
					localStorage['block_list'] = blockList.join(',');
					port.postMessage({ name: "updateDataStore", message: localStorage });
				}
			}
			// Reset blocks config
		} else if (event.name === 'removeUserFromBlocklist') {


			// Get username
			var user = event.message;

			// Get the blocklist array
			list = localStorage['block_list'].split(',');

			// Get the removed user index
			index = list.indexOf(user);

			// Remove user from array
			list.splice(index, 1);

			// Save changes in localStorage
			localStorage['block_list'] = list.join(',');

			// Update dataStore
			port.postMessage({ name: "updateDataStore", message: localStorage });

			// Save posted settings
		} else if (event.name === 'setSetting') {

			let temp = {}
			temp[event.key] = event.val
			browser.storage.sync.set(temp)
		}
	});
});

let ports = []

function connected(p) {
	ports[p.sender.tab.id] = p

	console.log('connected: ' + p.sender.tab.id)

	// when connected, send the settings to the contentscript
	browser.storage.sync.get(null, function (item) {

		// only send the settings to the new page
		p.postMessage({ name: "setSettings", message: item })
	})
}

// send message about a setting has been changed
function storageChange(changes, area) {
	var changedItems = Object.keys(changes);

	for (var item of changedItems) {
		let tmp = {}
		tmp[item] = changes[item].newValue
		sendMessage({ name: "updateSettings", message: tmp })
	}
}

function sendMessage(param) {
	ports.map(port => {
		console.log(port.sender.tab.id)
		port.postMessage(param)
	})
}

// if this is the extension's first load, save default settings
browser.storage.sync.get('installed', function (item) {
	if (Object.keys(item).length === 0 && item.constructor === Object) {
		console.log(item)
		browser.storage.sync.set(defaultSettings.default);
		browser.storage.sync.set({ installed: true });
	}
})

browser.storage.onChanged.addListener(storageChange);
browser.runtime.onConnect.addListener(connected)
