var mxstorage = null;
var rt = window.external.mxGetRuntime();
mxstorage =
{
	getItem:function(key)
	{
		var value = rt.storage.getConfig(key);
		if(value == "")
		{
			return 'undefined';
		}
		return value;
	},
	setItem:function(key,value)
	{
		rt.storage.setConfig(key, value);
	}
}			

// Set properties default values
if(mxstorage.getItem('chat_hide') 							== 'undefined') mxstorage.setItem('chat_hide','false');
if(mxstorage.getItem('custom_blocks')						== 'undefined') mxstorage.setItem('custom_blocks','false');
if(mxstorage.getItem('jump_unreaded_messages')				== 'undefined') mxstorage.setItem('jump_unreaded_messages', 'true');
if(mxstorage.getItem('fav_show_only_unreaded')				== 'undefined') mxstorage.setItem('fav_show_only_unreaded', 'true');
if(mxstorage.getItem('fav_show_only_unreaded_remember')		== 'undefined') mxstorage.setItem('fav_show_only_unreaded_remember', 'false');
if(mxstorage.getItem('fav_show_only_unreaded_opened')		== 'undefined') mxstorage.setItem('fav_show_only_unreaded_opened', 'false');
if(mxstorage.getItem('short_comment_marker')				== 'undefined') mxstorage.setItem('short_comment_marker', 'true');
if(mxstorage.getItem('highlight_forum_categories')			== 'undefined') mxstorage.setItem('custom_list_styles', 'false');
if(mxstorage.getItem('threaded_comments')					== 'undefined') mxstorage.setItem('threaded_comments', 'false');
if(mxstorage.getItem('block_list')							== 'undefined') mxstorage.setItem('block_list', '');
if(mxstorage.getItem('autoload_next_page')					== 'undefined') mxstorage.setItem('autoload_next_page', 'true');
if(mxstorage.getItem('overlay_reply_to')					== 'undefined') mxstorage.setItem('overlay_reply_to', 'true');
if(mxstorage.getItem('highlight_comments_for_me')			== 'undefined') mxstorage.setItem('highlight_comments_for_me', 'true');
if(mxstorage.getItem('show_mentioned_comments')				== 'undefined') mxstorage.setItem('show_mentioned_comments', 'true');
if(mxstorage.getItem('show_mentioned_comments_in_links')	== 'undefined') mxstorage.setItem('show_mentioned_comments_in_links', 'true');
if(mxstorage.getItem('blocks_config')						== 'undefined') mxstorage.setItem('blocks_config', '');
if(mxstorage.getItem('hide_blocks_buttons')					== 'undefined') mxstorage.setItem('hide_blocks_buttons', 'false');
if(mxstorage.getItem('show_navigation_buttons')				== 'undefined') mxstorage.setItem('show_navigation_buttons', 'true');
if(mxstorage.getItem('show_navigation_buttons_night')		== 'undefined') mxstorage.setItem('show_navigation_buttons_night', 'false');
if(mxstorage.getItem('navigation_buttons_position')			== 'undefined') mxstorage.setItem('navigation_buttons_position', 'leftcenter');
if(mxstorage.getItem('navigation_button_night_state')		== 'undefined') mxstorage.setItem('navigation_button_night_state', 'false');
if(mxstorage.getItem('remove_ads')							== 'undefined') mxstorage.setItem('remove_ads', 'false');
if(mxstorage.getItem('wysiwyg_editor')						== 'undefined') mxstorage.setItem('wysiwyg_editor', 'false');
if(mxstorage.getItem('topic_whitelist')						== 'undefined') mxstorage.setItem('topic_whitelist', '');
if(mxstorage.getItem('fetch_new_comments')					== 'undefined') mxstorage.setItem('fetch_new_comments', 'true');
if(mxstorage.getItem('disable_point_system')				== 'undefined') mxstorage.setItem('disable_point_system', 'false');
if(mxstorage.getItem('profiles')							== 'undefined') mxstorage.setItem('profiles', '');
if(mxstorage.getItem('debugger_messages')					== 'undefined') mxstorage.setItem('debugger_messages', '');
if(mxstorage.getItem('columnify_comments')					== 'undefined') mxstorage.setItem('columnify_comments', 'false');
if(mxstorage.getItem('better_yt_embed')						== 'undefined') mxstorage.setItem('better_yt_embed', 'true');
if(mxstorage.getItem('youtube_embed_limit')					== 'undefined') mxstorage.setItem('youtube_embed_limit', '10');
if(mxstorage.getItem('quick_user_info')						== 'undefined') mxstorage.setItem('quick_user_info', 'false');
if(mxstorage.getItem('quick_insertion')						== 'undefined') mxstorage.setItem('quick_insertion', 'false');
if(mxstorage.getItem('spoiler_button')						== 'undefined') mxstorage.setItem('spoiler_button', 'false');

// Message Center
if(mxstorage.getItem('message_center')						== 'undefined') mxstorage.setItem('message_center', 'false');
if(mxstorage.getItem('mc_messages')							== 'undefined') mxstorage.setItem('mc_messages', '');
if(mxstorage.getItem('mc_selected_tab')						== 'undefined') mxstorage.setItem('mc_selected_tab', 0);

// Sync
if(mxstorage.getItem('sync_auth_key')						== 'undefined') mxstorage.setItem('sync_auth_key', '');
if(mxstorage.getItem('sync_nick')							== 'undefined') mxstorage.setItem('sync_nick', '');
if(mxstorage.getItem('sync_last_sync')						== 'undefined') mxstorage.setItem('sync_last_sync', '0');

console.log("oke");
rt.listen("rt_listening", function() {
	console.log("namar");
});

rt.listen("rt_listening", function(event) {
	console.log("listening" + event.name);
	// Send back the settings object
	if(event.name == 'getSettings') {
		
		rt.post("setSettings", [{ name : "setSettings", message : localStorage }]);

	// Sets the blocks config
	} else if(event.name == 'setBlocksConfig') {
		mxstorage.setItem('blocks_config', event.message);

	// Add user to blocklist
	} else if(event.name == 'addToBlocklist') {

		// If theres in no entry in localStorage
		if(typeof mxstorage.getItem('block_list') == "undefined") {
			mxstorage.setItem('block_list', '');
		}

		// If the blocklist is empty
		if(mxstorage.getItem('block_list') == '') { 
			mxstorage.setItem('block_list', event.message);
			rt.post("updateDataStore", [{ name : "updateDataStore", message : localStorage }]);

		// If the blocklist is not empty
		} else {
			var blocklist = new Array();
				blockList = mxstorage.setItem('block_list').split(',');
				if(blockList.indexOf(event.message) == -1) { 
					blockList.push(event.message); 
					mxstorage.setItem('block_list', blockList.join(','));
					rt.post("updateDataStore", [{ name : "updateDataStore", message : localStorage }]);
				}
		}
	// Reset blocks config
	} else if(event.name == 'resetBlocksConfig') {
		mxstorage.setItem('blocks_config', '');

	// Remove user form blocklist
	} else if(event.name == 'removeUserFromBlocklist') {


		// Get username
		var user = event.message;

		// Get the blocklist array
		var list = mxstorage.getItem('block_list').split(',');

		// Get the removed user index
		var index = list.indexOf(user);

		// Remove user from array
		list.splice(index, 1);
	
		// Save changes in localStorage
		mxstorage.setItem('block_list', list.join(','));
		
		// Update dataStore
		rt.post("updateDataStore", [{ name : "updateDataStore", message : localStorage }]);

	// Save posted settings
	} else if(event.name == 'setSetting') {

		// Setting name
		var key = event.key;
	
		// Setting value
		var val = event.val;
	
		localStorage[key] = val;

	// Store selected tab in message center
	} else if(event.name == 'setMCSelectedTab') {
		mxstorage.setItem('mc_selected_tab', event.message);

	// Store own messages for message center
	} else if(event.name == 'setMCMessages') {
		mxstorage.setItem('mc_messages', event.message);

	// Add topic to whitelist
	} else if(event.name == 'addTopicToWhitelist') {

		// If the whitelist is empty
		if(mxstorage.getItem('topic_whitelist') == '') {
			mxstorage.setItem('topic_whitelist', event.message);

		// If the blocklist is not empty
		} else {

			var whitelist = new Array();
				whitelist = mxstorage.getItem('topic_whitelist').split(',');

				if(whitelist.indexOf(event.message) == -1) { 
					whitelist.push(event.message);
					mxstorage.setItem('topic_whitelist', whitelist.join(','));
				}
		}


	// Remove topic from whitelist
	} else if(event.name == 'removeTopicFromWhitelist') {

		// Get username
		var id = event.message;

		// Get the blocklist array
		var list = mxstorage.getItem('topic_whitelist').split(',');

		// Get the removed user index
		var index = list.indexOf(id);

		// Remove user from array
		list.splice(index, 1);
	
		// Save changes in localStorage
		mxstorage.setItem('topic_whitelist', list.join(','));

	// Update faves filter last state
	} else if(event.name == 'updateFavesFilterLastState') {

		mxstorage.setItem('fav_show_only_unreaded_opened', event.message);
	}
});