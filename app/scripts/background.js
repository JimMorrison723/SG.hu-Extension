import 'chromereload/devonly'
import { optionValues } from './utils/default';
import { database} from "./utils/database"
/*import { port } from './utils/messaging';*/
//optionValues();

// Set properties default values
if( typeof localStorage['chat_hide'] 							=== 'undefined') localStorage['chat_hide'] 							= 'false';
if( typeof localStorage['custom_blocks']						=== 'undefined') localStorage['custom_blocks'] 						= 'false';
if( typeof localStorage['jump_unreaded_messages']				=== 'undefined') localStorage['jump_unreaded_messages']				= 'true';
if( typeof localStorage['fav_show_only_unreaded']				=== 'undefined') localStorage['fav_show_only_unreaded']				= 'true';
if( typeof localStorage['fav_show_only_unreaded_remember']		=== 'undefined') localStorage['fav_show_only_unreaded_remember']	= 'false';
if( typeof localStorage['fav_show_only_unreaded_opened']		=== 'undefined') localStorage['fav_show_only_unreaded_opened']		= 'false';
if( typeof localStorage['short_comment_marker']					=== 'undefined') localStorage['short_comment_marker']				= 'true';
if( typeof localStorage['highlight_forum_categories']			=== 'undefined') localStorage['custom_list_styles']					= 'false';
if( typeof localStorage['threaded_comments']					=== 'undefined') localStorage['threaded_comments']					= 'false';
if( typeof localStorage['block_list']							=== 'undefined') localStorage['block_list']							= '';
if( typeof localStorage['autoload_next_page']					=== 'undefined') localStorage['autoload_next_page']					= 'true';
if( typeof localStorage['overlay_reply_to']						=== 'undefined') localStorage['overlay_reply_to']					= 'false';
if( typeof localStorage['highlight_comments_for_me']			=== 'undefined') localStorage['highlight_comments_for_me']			= 'true';
if( typeof localStorage['blocks_config']						=== 'undefined') localStorage['blocks_config']						= '';
if( typeof localStorage['hide_blocks_buttons']					=== 'undefined') localStorage['hide_blocks_buttons']				= 'false';
if( typeof localStorage['show_navigation_buttons']				=== 'undefined') localStorage['show_navigation_buttons']			= 'true';
if( typeof localStorage['show_navigation_buttons_night']		=== 'undefined') localStorage['show_navigation_buttons_night']		= 'false';
if( typeof localStorage['navigation_buttons_position']			=== 'undefined') localStorage['navigation_buttons_position']		= 'leftcenter';
if( typeof localStorage['navigation_button_night_state']		=== 'undefined') localStorage['navigation_button_night_state']		= 'false';
if( typeof localStorage['remove_ads']							=== 'undefined') localStorage['remove_ads']							= 'false';
if( typeof localStorage['wysiwyg_editor']						=== 'undefined') localStorage['wysiwyg_editor']						= 'false';
if( typeof localStorage['topic_whitelist']						=== 'undefined') localStorage['topic_whitelist']					= '';
if( typeof localStorage['fetch_new_comments']					=== 'undefined') localStorage['fetch_new_comments']					= 'true';
if( typeof localStorage['disable_point_system']					=== 'undefined') localStorage['disable_point_system']				= 'false';
if( typeof localStorage['profiles']								=== 'undefined') localStorage['profiles']							= '';
if( typeof localStorage['debugger_messages']					=== 'undefined') localStorage['debugger_messages']					= '';
if( typeof localStorage['columnify_comments']					=== 'undefined') localStorage['columnify_comments']					= 'false';
if( typeof localStorage['youtube_embed_limit']					=== 'undefined') localStorage['youtube_embed_limit']				= '10';
if( typeof localStorage['quick_user_info']						=== 'undefined') localStorage['quick_user_info']					= 'false';
if( typeof localStorage['quick_insertion']						=== 'undefined') localStorage['quick_insertion']					= 'false';
if( typeof localStorage['spoiler_button']						=== 'undefined') localStorage['spoiler_button']						= 'false';
if( typeof localStorage['msg_per_page']							=== 'undefined') localStorage['msg_per_page']						= '80';
if( typeof localStorage['inline_image_viewer']					=== 'undefined') localStorage['inline_image_viewer']				= 'false';

// Message Center
if( typeof localStorage['message_center']						=== 'undefined') localStorage['message_center']						= 'false';
if( typeof localStorage['mc_messages']							=== 'undefined') localStorage['mc_messages']						= '';
if( typeof localStorage['mc_selected_tab']						=== 'undefined') localStorage['mc_selected_tab']					= 0;

// Sync
if( typeof localStorage['sync_auth_key']						=== 'undefined') localStorage['sync_auth_key']						= '';
if( typeof localStorage['sync_nick']							=== 'undefined') localStorage['sync_nick']							= '';
if( typeof localStorage['sync_last_sync']						=== 'undefined') localStorage['sync_last_sync']						= '0';

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (event) {

		// For development only!
		//chrome.storage.sync.clear();

		// Send back the settings object
		if (event.name === 'getSetting') {

			chrome.storage.sync.get(null, function (items) {
				port.postMessage({name: "allSettings", message: items});
			});

		// Save posted settings
		} else if (event.name === 'setSetting') {

			// They say javascript is expected to work this way. Okay then
			let save = {};
			save[event.key] = event.val;
			chrome.storage.sync.set(save);
		}
		else if (event.name === 'allSettings') {

			console.log('all');
		}
	});
});

/*chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log(key, namespace,	storageChange.oldValue,	storageChange.newValue);
	}
});*/