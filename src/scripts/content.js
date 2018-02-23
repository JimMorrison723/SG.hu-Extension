import browser from './util/browser'
import { cp, settings } from './settings'

export let dataStore
export let scripts = {}
export let isLoggedIn
export let userName

export let port = browser.runtime.connect();

// TODO: find a better way for conditinoal import
switch (whatPage()) {
	case 1:
		scripts = require('./modules/forum/index')
		isLoggedIn = $('.user-hello').length
		userName = $('.user-hello').text().match(/Üdv, (.*)!/)[1]
		break
	case 2:
		scripts = require('./modules/topik/index')
		isLoggedIn = $('#comments-login').length
		userName = $('#comments-login').find('span').text()
		break
	default:
		isLoggedIn = $('form[name="newmessage"]').length
		userName = $('#msg-head').find('b a').html()
		break
}

function startup() {

	for (var item in scripts) {
		if (dataStore[item]) {
			scripts[item].activated()
		}
	}

}

function whatPage() {

	// Forum main page
	if (document.location.href.match(/forum\/$/)) return 1

	// Topic page
	else if (document.location.href.match(/forum\/tema/)) return 2

	// Article page
	else if (document.location.href.match(/cikkek/)) return 2

	else return 3
}

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

// TODO:
// Filter out iframes
// if (window.top === window) {
// 	port.postMessage({name: "getdataStore"});
// }
