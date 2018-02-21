import browser from './browser'

export function setSetting(item) {
	chrome.storage.sync.set(item, function (asd) {
		return asd
	});
}

export function getSetting(item) {
	chrome.storage.sync.get(item, function (obj) {
		console.log(obj);
		return obj.key
	});
}

export function getSettings(item) {
	chrome.storage.sync.get(null, function (obj) {
		console.log(obj);
		return obj
	});
}
