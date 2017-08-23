import { port } from './messaging.js';
import {extInit} from "../content/content";
/*import { defaultValues } from "./defaults"*/

const defaultValues = {
	chatHide: false,
	customBlocks: false,
	jumpUnreadedMessages: true,
	favShowOnlyUnreaded: true,
	favShowOnlyUnreadedRemember: false,
	favShowOnlyUnreadedRememberOpened: false,
	shortCommentMarker: true,
	highlightForumCategories: false,
	threadedComments: false,
	block_list: '',
	autoloadNextPage: true,
	overlayReplyTo: false,
	highlightCommentsForMe: true,
	blocks_config: '',
	hide_blocks_buttons: false,
	showNavigationButtons: true,
	showNavigationButtonsNight: false,
	navigationButtonsPosition: 'leftcenter',
	navigationButtonNightState: false,
	removeAds: false,
	topic_whitelist: '',
	fetchNewComments: false,
	disablePointSystem: false,
	profiles: '',
	debuggerMessages: '',
	columnifyComments: false,
	quickUserInfo: false,
	quickInsertion: false,
	msg_per_page: 80,
	inlineImageViewer: false,
	inline_image_viewer: false
};

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