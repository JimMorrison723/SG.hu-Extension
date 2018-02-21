import browser from './util/browser'
import { cp, settings } from './settings'

let scripts = {}

// TODO: find a way to conditinoal import and
// place this under whatPage()
if (document.location.href.match(/forum\/$/)) {
	scripts = require('./modules/forum/index')
} else if (document.location.href.match(/forum\/tema/)) {
	scripts = require('./modules/topik/index')
}

let dataStore

let port = browser.runtime.connect();

browser.runtime.onConnect.addListener(function () {
	console.log('content connected')
})

port.onMessage.addListener(function (event) {

	if (event.name === 'setSettings') {

		// save dataStore
		dataStore = event.message
		startup()
		cp.init(whatPage(), dataStore)

		// handle setting change message
	} else if (event.name === 'updateSettings') {

		// update setttings with the new data
		settings.update(event.message)

		for (const [key, value] of Object.entries(event.message)) {
			dataStore[key] = value,
				scripts[key].toggle()
		}

	}
});

function startup() {

	for (var item in scripts) {
		if (dataStore[item]) {
			scripts[item].activated()
		}
	}

}

function whatPage() {
	// Forum main page
	if (document.location.href.match(/forum\/$/)) {
		// import * as modules from './modules/forum/index'
		return 1;

		// Topic page
	} else if (document.location.href.match(/forum\/tema/)) {
		return 2;

		// Article page
	} else if (document.location.href.match(/cikkek/)) {
		return 2;

	} else {
		return 3

	}
}

// TODO:
// Filter out iframes
// Request dataStore object
// if (window.top === window) {
// 	port.postMessage({name: "getdataStore"});
// }
