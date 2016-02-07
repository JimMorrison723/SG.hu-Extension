var mxstorage = null;
var rt = window.external.mxGetRuntime();

rt.listen("listen_settings", function(event) {

	if(event.name == 'setSettings') {
	
		// Save localStorage data
		rt.storage = event.message;
	
		// Add domready event
		$(document).ready(function() {
			extInit();
		});
	
	} else if(event.name == 'updateDataStore') {
		
		// Update dataStore with the new data
		rt.storage = event.message;

		// Save changes to sync
		if(dataStore('sync_status') == 'true') {
			sync_cp.save();
		}		
	}
});

		$(document).ready(function() {
			extInit();
		});
var ext_url = "mxaddon-pkg://{3A7DFFA6-D3F0-42D1-87DF-C026FEE05D0B}/";

mxstorage =
{
	getItem:function(key)
	{
		var value = rt.storage.getConfig(key);
		if(value == "")
		{
			return null;
		}
		return value;
	},
	setItem:function(key,value)
	{
		rt.storage.setConfig(key, value);
	}
}

// Predefined vars
var userName, isLoggedIn, dataStore;

// var port = chrome.extension.connect();

function convertBool(string){

	switch(string.toLowerCase()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
		default: return Boolean(string);
	}
}

function setPredefinedVars() {
	
	loggedIn = isLoggedIn();
	
	if(loggedIn) {
		userName = getUserName();
	}
}

function isLoggedIn() {
	
	// Article page
	if(document.location.href.match('cikkek')) {
		return $('form[name="newmessage"]').length ? true : false;
	
	
	// Forum main page
	} else if(document.location.href.match('forum\/$')) {
		return $('.user-hello').length ? true : false;
	
	// Topic page
	} else if(document.location.href.match('\/forum\/tema')) {
		return ( $('.comments-login').length == 0) ? true : false;
	}
	
}

function getUserName() {

	// Article page
	if(document.location.href.match('cikkek')) {
		return $('#msg-head b a').html();

	// Forum main page
	} else if(document.location.href.match('forum\/$')) {
		return $('.user-hello').text().match(/Üdv, (.*)!/)[1];
	
	// Topic page
	} else if(document.location.href.match('\/forum\/tema')) {
	
		return $('#comments-login span').text();
	}
}


var chat_hide = {
	
	activated : function() {

		$('#forum-chat').hide();
		$('#forum-wrap > .blue-border-top').hide();
		$('#forum-wrap > .forums-block:first').css({'margin-top':'0px'});
	},
	
	disabled : function() {

		$('#forum-chat').show();
		$('#forum-wrap > .blue-border-top').show();
		$('#forum-wrap > .forums-block:first').css({'margin-top':'35px'});
	}
}


var jump_unreaded_messages = {
	
	activated : function() {
	
		var msgPerPage = dataStore['msg_per_page'];
	
		$('#favorites-list span').find('a').each(function() { //.ext_faves'
			
			// If theres a new message
			if($(this).find('span[class="new"]').length > 0) {
			
				// Get the new messages count
				var newMsg = parseInt($(this).find('span[class="new"]').html().match(/\d+/g));

				// Get last msn's page number
				var page = Math.ceil( newMsg / msgPerPage );

				// Rewrite the url
				$(this).attr('href', $(this).attr('href') + '?order=desc&page='+page+'&newmsg='+newMsg);
				//$(this).attr('href', $(this).attr('href') + '#last-read');
			
			// Remove newmsg var from link
			} else if( $(this).attr('href').indexOf('&order') != -1) {
				
				var start = $(this).attr('href').indexOf('&order');
				
				$(this).attr('href', $(this).attr('href').substring(0, start));
			}
		});
	},
	
	disabled : function() {

		$('#favorites-list').find('a').each(function() {
			
			if( $(this).attr('href').indexOf('&order') != -1) {
				
				var start = $(this).attr('href').indexOf('&order');
				
				$(this).attr('href', $(this).attr('href').substring(0, start));
			}
		});
	},
	
	topic : function() {
	
// Get new messages counter
		var newMsg = document.location.href.split('&newmsg=')[1];
		
		// Return if there is not comment counter set
		if(typeof newMsg == "undefined" || newMsg == '' || newMsg == 0) {
			return false;
		}
		
		// Get the last msg
		var lastMsg = newMsg % msgPerPage;
		
		// Target comment element
		if($('.ext_new_comment').length > 0) {
			var target = $('.ext_new_comment:first').closest('li.forum-post');
		
		} else if( $('a#last-read').length > 0) {
			var target = $('a#last-read').prev();
			
				// Insert the horizontal rule
				$('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr');
				
		} else {
			var target = $('.topichead').closest('center').eq(lastMsg-1);
			
			// Insert the horizontal rule
			$('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr');
		}
		$('#ext_unreaded_hr').css({'height':'0px'})
		
		// Append hr tag content if any
		//var content = $('a#last-read').find('li.forum-post').insertBefore('a#last-read');
			
		// Remove original hr tag
		$('a#last-read').remove();

		// Url to rewrite
		var url = document.location.href.replace(/&newmsg=\d+/gi, "");

		// Update the url to avoid re-jump
		history.replaceState({ page : url }, '', url);
				
		// Call the jump method with 1 sec delay
		setTimeout(function(){ 
			jump_unreaded_messages.jump();
		}, 1000);
		
		// Add click event the manual 'jump to last msg' button
		$('a[href*="#last-read"]').click(function(e) {
			e.preventDefault();
			jump_unreaded_messages.jump();
		});
	},
	
	
	jump : function() {
		
		// Get the target element
		if($('.ext_new_comment').length > 0) {
			var target = $('.ext_new_comment:first').closest('center');
		
		} else if($('#ext_unreaded_hr').length > 0) {
			var target = $('#ext_unreaded_hr');
		
		} else {
			return false;
		}

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);
		
		// Scroll to target element
		$('body').animate({ scrollTop : targetOffset}, 500);
	}
	
};

var fav_show_only_unreaded = {

	opened : false,
	
	init : function() {
		if(mxstorage.getItem('fav_show_only_unreaded_remember') == 'true') {
			fav_show_only_unreaded.opened = false;
		}
		if(convertBool(mxstorage.getItem('fav_show_only_unreaded_opened')) == 'true') {
			$('#favorites-open-close-button #icon').html() = '-';
		}
	},

activated : function() {

// Remove original toggle button
		$('div[class*="csakujuzi"]').remove();

		// Remove style tags from faves containers
		$('.ext_faves').next().children('nav').removeAttr("style");

		// Disable page auto-hide function
		setCookie('favs', 'true', 365);	

		// Move the button away to place toggle button
		$('#ext_refresh_faves').css('right', 18);
		$('#ext_read_faves').css('right', 36);
		
		var Alllength = $('#favorites-list a[class*="category-"]').length;
		var unreaded_length = $('#favorites-list a[class^="category-"][class*="fav-not-new-msg"]').length;
		// $('#favorites-list .fav-not-new-msg').addClass('ext_hidden_fave'); // No need in new design
		//Fix
		if (typeof unreaded_length === undefined) {
			unreaded_length = 0;
		}
	
		// Remove old toggle button if any
		$('#ext_show_filtered_faves').remove();
		
		// Set the toggle button
		if($('#ext_nav_faves_wrapper').length) {
			$('#ext_nav_faves_wrapper').prepend('<div id="ext_show_filtered_faves"></div>');
		} else {
			$('.ext_faves').next().append('<div id="ext_show_filtered_faves"></div>');
		}
		$('#ext_show_filtered_faves').append('<span id="ext_show_filtered_faves_arrow"></span>');
	
		// Apply some styles
		$('#ext_show_filtered_faves_arrow').attr('class', 'show');

		// Set event handling
		$('#ext_show_filtered_faves').off('click').on('click', function() {
		
			if(fav_show_only_unreaded.opened == false) {
				$('#ext_filtered_faves_error').hide();
				$('#ext_show_filtered_faves_arrow').attr('class', 'hide');
				$('.fav-not-new-msg').show();
				
				fav_show_only_unreaded.opened = true;

				// Update last state in LocalStorage
				port.postMessage({ name : "updateFavesFilterLastState", message : true });

				// Reposition the popup if any
				if( $(this).closest('#ext_nav_faves_wrapper').length) {
					show_navigation_buttons.findPosition( $('#ext_nav_faves_wrapper'), $('#ext_nav_faves') );
				}
			
			} else {
				$('#ext_filtered_faves_error').show();
				$('#ext_show_filtered_faves_arrow').attr('class', 'show');
				$('.fav-not-new-msg').hide(); //.ext_hidden_fave
				
				fav_show_only_unreaded.opened = false;

				// Update last state in LocalStorage
				port.postMessage({ name : "updateFavesFilterLastState", message : false });

				// Reposition the popup if any
				if( $(this).closest('#ext_nav_faves_wrapper').length) {
					show_navigation_buttons.findPosition( $('#ext_nav_faves_wrapper'), $('#ext_nav_faves') );
				}
			}
		});

		/*console.log(unreaded_length);
		console.log($('#ext_filtered_faves_error').length);*/
		// Create an error message if theres no topik with unreaded messages
		if( unreaded_length == 0 && $('#ext_filtered_faves_error').length == 0) {
			$('.ext_faves').after('<p id="ext_filtered_faves_error">Nincs olvasatlan téma</p>');
		}

		// Check opened status
		if(fav_show_only_unreaded.opened == true) {
			$('#ext_filtered_faves_error').hide();
			$('#ext_show_filtered_faves_arrow').attr('class', 'hide');
			$('.ext_hidden_fave').show();
		}
	},
	
	disabled : function() {
		
		// Remove hidden class
		$('.ext_hidden_fave').removeClass('ext_hidden_fave');
		
		// Remove toggle button
		$('#ext_show_filtered_faves').remove();

		// Put back the buttons to the right side
		//$('#ext_refresh_faves').css('right', 0);
		$('#ext_read_faves').css('right', 18);
	}
};


var short_comment_marker = {
	
	activated : function() {
	
		$('#favorites-list').find('a').each(function() {
		
			if($(this).find('span[class*=new]').length > 0) {
			
				// Received new messages counter
				var newMsg = parseInt( $(this).find('span[class=new]').html().match(/\d+/g) ); // \d - non-digit character
			
				// Remove the old marker text
				$(this).find('span[class*=new]').hide();
				/*$(this).find('font:last').hide();*/
			
				// Add the new marker after the topic title
				$(this).html( $(this).html() + ' <span class="ext_short_comment_marker" style="color: red;">'+newMsg+'</span>');
			}
		});
	},
	
	disabled : function() {
	
		$('#favorites-list').find('a').each(function() {
		
			if($(this).find('span[class*=new]').length > 0) {
						
				// Remove the old marker text
				$(this).find('span[class*=new]').show();
				/*$(this).find('font:last').show();*/
			
				// Add the new marker after the topic title
				
				$(this).find('.ext_short_comment_marker').remove();
			}
		});
	}
};

var blocklist =  {
	
	
	hidemessages : function() {

		// Return false if theres no blocklist entry
		if(typeof mxstorage.getItem('block_list') == "undefined" || mxstorage.getItem('block_list') == '') {
			return false;
		}
		
		// Maxthon fix
		if (mxstorage.getItem('block_list') != null) {
			var deletelist = mxstorage.getItem('block_list').split(',');
		};

		$("#forum-posts-list ul li header").each( function() {
			
			if(document.location.href.match('cikkek')) {
			
				var nick = $(this).find('a:first').html();

			} else {
			
				var nick = ($(this).find("a img").length == 1) ? $(this).find("a img").attr("alt") : $(this).find("a")[0].innerHTML;
					nick = nick.replace(/ - VIP/, "");
			}
			
			for(var i = 0; i < deletelist.length; i++) {
				if(nick.toLowerCase() == deletelist[i].toLowerCase()) {
					$(this).closest('li.forum-post').hide();
				}
			}
		});
	},
	
	block : function(el) {

		var nick = '';

		var anchor = $(el).closest('#forum-posts-list ul li header').find('a[href*="/felhasznalo"]');
		var tmpUrl = anchor.attr('href');

		if(anchor.children('img').length > 0) {
			nick = anchor.children('img').attr('title').replace(" - VIP", "");
	
		} else {
			nick = anchor.html().replace(" - VIP", "");
		}
	
		if(confirm('Biztos tiltólistára teszed "'+nick+'" nevű felhasználót?')) {
	
			$('#forum-posts-list ul li header a[href="'+tmpUrl+'"]').each(function() {
	
				// Remove the comment
				$(this).closest('li.forum-post').animate({ height : 0, opacity : 0 }, 500, function() {
					$(this).hide();
				})
			});
		
			// Store new settings in localStorage
			port.postMessage({ name : "addToBlocklist", message : nick });	
			
			// Add name to blocklist 
			$('<li><span>'+nick+'</span> <a href="#">töröl</a></li>').appendTo('#ext_blocklist')
		
			// Remove empty blocklist message
			$('#ext_empty_blocklist').remove();
		}
	},
	
	unblock : function(user) {

		$("#forum-posts-list ul li header").each( function() {
			
			if(document.location.href.match('cikkek')) {
			
				var nick = $(this).find('a:first').html();
			} else {
			
				var nick = ($(this).find("a img").length == 1) ? $(this).find("a img").attr("alt") : $(this).find("a")[0].innerHTML;
					nick = nick.replace(/ - VIP/, "");
			}

			if(nick.toLowerCase() == user.toLowerCase()) {

				// Show temporary the comment height
				$(this).closest('li.forum-post').css({ display : 'block', height : 'auto' });
				
				// Get height
				var height = $(this).closest('li.forum-post').height();
				
				// Set back to invisible, then animate
				$(this).closest('li.forum-post').css({ height : 0 }).animate({ opacity : 1, height : height }, 500);
			}
		});
	}
};






var highlight_forum_categories = {
	
	activated : function() {
		$('nav#favorites-list a.category').css('color', '#ffffff');
		$('nav#favorites-list a.category').css('background-color', '#6c9ff7');
		$('nav#favorites-list a.category').css('padding', '2px');
	},
	
	disabled : function() {
		$('nav#favorites-list a.category').css('color', '#444');
		$('nav#favorites-list a.category').css('background-color', '#fff');
		$('nav#favorites-list a.category').css('padding', '0px');
	}
}


var autoload_next_page = {
	
	progress : false,
	currPage : null,
	maxPage : null,
	counter : 0,
	
	activated : function() {
		
		// Artcile
		if(document.location.href.match('cikkek')) {
		
			// Current page index
			autoload_next_page.currPage = 1;
			
			// Get topic ID
			var topic_id = $('nav#breadcrumb select option:selected').val();
			
			// Get the topic page to determinate max page number
			$.ajax({
				url : 'listazas.php3?id=' + topic_id,
				success : function(data) {
					
					// Parse the response HTML
					var tmp = $(data);
					
					// Fetch the max page number
					autoload_next_page.maxPage = parseInt($(tmp).find('nav.pagination a:last').prev().html());
				}
			});
			
			// Get max page number 
			autoload_next_page.maxPage = parseInt($('nav.pagination a:last').prev().html());

		// Topic
		} else {
			
			// Current page index
			autoload_next_page.currPage = parseInt($('nav.pagination a.current').html());

			// Get max page number - Fix for "Last page"
			var temp = ($('nav.pagination a:last').attr('href'));
			autoload_next_page.maxPage = parseInt(temp.substring(temp.lastIndexOf("=") + 1));
		}
		
		$(document).scroll(function() {
			
			var docHeight = $('body').height();
			var scrollTop = $('body').scrollTop();

			if(docHeight - scrollTop < 3000 && !autoload_next_page.progress && autoload_next_page.currPage < autoload_next_page.maxPage) {
				autoload_next_page.progress = true;
				autoload_next_page.load();
			}
		});
		
	},
	
	disabled : function() {
		
		$(document).unbind('scroll');
	},
	
	load : function() {
		
		// Url to call
		// date ASC order
		if(document.location.href.match('timeline')) {
			var url = document.location.href.substring(0, 44);
				url = url+'&order=timeline&index='+(autoload_next_page.currPage+1)+'';
			
		// Date DESC order
		} else {
			if(document.location.href.match('cikkek')) {
			
				// Get topic ID
				var topic_id = $('nav#breadcrumb select option:selected').val();
				
				// Url to call	
				var url = 'forum/tema/'+topic_id;
					url =  url+'?page='+(autoload_next_page.currPage+1)+'&callerid=1';
			
			} else { 
				var url = document.location.href.substring(0, 34);
					url = url+'?page='+(autoload_next_page.currPage+1)+'';
			}
		}
		
		// Make the ajax query
		$.get(url, function(data) {

			// Create the 'next page' indicator
			if(dataStore['threaded_comments'] != 'true') {
				if(document.location.href.match('cikkek')) {
					$('<div class="ext_autopager_idicator">'+(autoload_next_page.currPage+1)+'. oldal</div>').insertAfter('.std2:last');
				} else {
					$('<div class="ext_autopager_idicator">'+(autoload_next_page.currPage+1)+'. oldal</div>').insertAfter('div#forum-posts-list:last');
				}
			}
			
			// Parse the response HTML
			var tmp = $(data);
			
			// Articles
			if(document.location.href.match('cikkek')) {
				var tmp = tmp.find('.b-h-o-head a').closest('.b-h-o-head');
				tmp.each(function() {

					// Maintain style settings
					$(this).addClass('topichead');
					$(this).css('background', 'url(images/ful_o_bgbg.gif)');
					$(this).find('.msg-dateicon a').css('color', '#444');
					
					// Insert
					$(this).closest('center').insertBefore('.std2:last');
					$(this).parent().css('width', 700);
				});
			
			// Topics
			} else {

				var tmp = tmp.find('div#forum-posts-list');
				tmp.insertAfter('.ext_autopager_idicator:last');
			}
			
			autoload_next_page.progress = false;
			autoload_next_page.currPage++;
			autoload_next_page.counter++;
			
			// Reinit settings

				// Set-up block buttons
				add_to_list.init();
				
				// threaded comments
				if(mxstorage.getItem('threaded_comments') == 'true') {
					threaded_comments.sort();
				}

				// highlight_comments_for_me
				if(mxstorage.getItem('highlight_comments_for_me') == 'true' && isLoggedIn()) {
					highlight_comments_for_me.activated();
				}
			
				// show menitoned comment
				if(mxstorage.getItem('show_mentioned_comments') == 'true') {
					show_mentioned_comments.activated();
				}

				if(mxstorage.getItem('disable_point_system') == 'true') {
					disable_point_system.activated();
				}

				// Profiles
				if(mxstorage.getItem('profiles') != '') {
					profiles.init();
				}

				if(mxstorage.getItem('columnify_comments') == 'true') {
					columnify_comments.activated();
				}

				if(mxstorage.getItem('quick_user_info') == 'true') {
					quick_user_info.activated();
				}

				if(mxstorage.getItem('better_yt_embed') == 'true') {

					//Check if the script should run or not
					if($('embed').length >= mxstorage.getItem('youtube_embed_limit'))
						better_yt_embed.activated();
				}

				/*//Night mode
				if (dataStore['show_navigation_buttons_night'] == 'true' && dataStore['navigation_button_night_state'] == 'true') {
					lights.forum_switchOn();
				}*/
		});
	}

};


var show_navigation_buttons = {
	
	activated : function() {
		
		// Create the scrolltop button
		$('<div id="ext_scrolltop">&#9650;</div>').prependTo('body');	
		
		// Add click event to scrolltop button
		$('#ext_scrolltop').click(function() {
			$('body').animate({ scrollTop : 0 }, 1000);
		});

		// Created the back button
		$('<div id="ext_back">&#9664;</div>').prependTo('body');	
		
		// Add event to back button
		$('#ext_back').click(function() {
			if(document.location.href.match('cikkek')) {
				document.location.href = 'http://sg.hu/';
			} else {
				document.location.href = 'http://sg.hu/forum/';
			}
		});
		
		
		if(!document.location.href.match('cikkek') && !document.location.href.match('\/uzenetek')) {
			
			var searchImg = "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";

			// Create search button
			$('<div id="ext_search"></div>').prependTo('body');
			
			// Place search overlay arrow
			$('<div id="ext_overlay_search_arrow"></div>').appendTo('body');
			
			// Place search icon background
			$('#ext_search').css('background-image', 'url(data:image/png;base64,'+ searchImg + ')');
		
			// Create the search event
			$('#ext_search').click( function() {
				if($('#ext_overlay_search').length) {
					show_navigation_buttons.removeOverlay();
				} else {
					show_navigation_buttons.showSearch();
				}
			});
			
			// Get topic ID
			var id = $('nav#breadcrumb select option:selected').val();
		
			// Determining current status
			var status, title = '';
			var whitelist = new Array();
			
			//Maxthon fix
			if (mxstorage.getItem('topic_whitelist') != null) {
				whitelist = mxstorage.getItem('topic_whitelist').split(',');
			};
				

				if(whitelist.indexOf(id) == -1) {
					status = '+';
					title = 'Téma hozzáadása a fehérlistához';
				} else {
					status = '-';
					title = 'Téma eltávolítása a fehérlistából';
				}
		
			// Create the whitelist button
			$('<div id="ext_whitelist" title="'+title+'">'+status+'</div>').prependTo('body');
		
			// Create whitelist event
			$('#ext_whitelist').click(function() { 
		
				topic_whitelist.execute(this);
			
			});			
		}
	
		
		// Execute when the user is logged in
		if(isLoggedIn() || document.location.href.match('listazas_msg.php')) {
		
			var starImg = "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";

			// Create faves button
			$('<div id="ext_nav_faves"></div>').prependTo('body');
		
			// Place the faves icon
			$('#ext_nav_faves').css('background-image', 'url(data:image/png;base64,' + starImg + ')');
		
			// Place faves opened cotainer
			$('<p id="ext_nav_faves_arrow"></p>').prependTo('body');
			$('<div id="ext_nav_faves_wrapper"></div>').prependTo('body');
			$('<div class="ext_faves"><h5>Kedvencek</h5></div>').appendTo('#ext_nav_faves_wrapper');
			$('<div class="ext_nav_fave_list"></div>').appendTo('#ext_nav_faves_wrapper');
		
			// Create faves button event
			$('#ext_nav_faves').click( function() {
				
				if($('#ext_nav_faves_wrapper').css('display') == 'none') {
					show_navigation_buttons.showFaves();
				} else {
					show_navigation_buttons.removeOverlay();
				}
			});	
		}

		//Night mode
		if (mxstorage.getItem('show_navigation_buttons_night') == 'true') {

			var lampOff = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAi9JREFUeNqFU0tPE1EYvVNwIbhz5cZEd7hxZdxqiEv/ipu2M9N2pp1OW7upFVMTtVNBsD5oIBUMYtxANAoGxZoYjEhkYVxoAp1OO23nef0+oVr6wMmce+8k3zlzvsclkiSRFiKRCJFlmQkGg4Ner5f4fD7A3h6NRgdbMe2cA2QIIkAmqVSK5HLKiKIo5wHnlKxyVBAEjGHayQcEEIFAgKTT6aGKWslSShv03/NxaWn5As9zGMe0u/h7EEWRSSaTTLms3nNdSpuG6RimZSPgjCK7i4vPT7Esi06ZTgHMm2QyN0+atmvoDcOC1wFQBHwbjuPQ9fVS3A/1gDoNdAmEQiEyNnZjpFZvUoADJCS6iCostuvab1ZWJ1nWjw6OdKWw5yBzomE6NVXTHU1vIiiirOmW6VC69v4D6/f7ezog4XCYkeUY+fJ1Ow5cuqvqlqo13LJWdwBUb9qbjx5PHw/wgf5dEEIhBlu5tf39QbnatH7taI2fOxVTq9vqdGHmLPyedM5C5xwwHMeS+/mHZ2oGlL1qUNw3Nr9NYY0gbqDvILVEEDE5NrT8aiX78vXb/Oq7Un5yKj8KM4LuPNJhAvu1IInE1WPFuQW2OL/AP332gldy45cE4Y+DwyexJRBPJIZnivN8YfbJFRDh7ih3R/dT+L+AJEU9PMeRwuzc5c9bPz6tlTYm4vGEJxwWuy5SHwFwIYrkWvr6cDY3fvHW7exp6HtPck+BViDcDYK2Mfd+ZMRvHAoMwBGwbGYAAAAASUVORK5CYII=";
			var lampOn = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAC4jAAAuIwF4pT92AAACCklEQVR42oWTz0pbURCH702abES6sxVX6tYuumjXpaViJZAQCMEEIrkEJRBiLqaBGJOmJoZIjAR1U3AhiAiCPkH9t7KlipQ+gVJxp+AL2G/knEu0pVlM5p5zZr75zZwTo1arGfV63cCbrVbLsG27JxgM7vv9/lufz3eCv2B9blnW20ajIbGmir83J1kOC4VCfzgcPg2FQluZTGYYG8xms69jsdh8IBC4SKVSIxIn8RriJJfLZTeV9gjelAPZE2s2m0alUjGi0aiFmnOgz2TPUcCPRwJLpdJLAJe5XK6LtakBCuYVj7rDZDI5owBuDfAqwDsAR7o66758Pv+C6gMilyRXPB4vAlhTAM9jwBsAP0UuKgb43sS2qbpNe69kwLS3BmBVAZ5ogFsBeujxioBRKroikUgNwEYikVghoZven3P+m/NhBTA1wLkagidJugY2SDWbye8y+UUUGSR/B7qOGmc27dco3iUH3Pc8kK9In8XvAC3S+xTrM9qTds22t+Mo0NM2qeCRYZLwDVvGvsg6nU5/0NIfPCT9oTbvr5Q+l5B/R/IPHtUN0o91YnvyA0C7Enp+z9AyPOuP2DSvcUzP6b8AqS7XyODGya9gn5A+h5+RGT1O/idApgxggqRZLI8VsM+cdwZoCJJ7gVRJrOIXgA4p+WZHgATKdTG8A6Z/x/3/4kk/VX/lv+L/AI69oML2jRXQAAAAAElFTkSuQmCC";

			var state = dmxstorage.getItem('navigation_button_night_state');
			var stata_name = lampOff;
				//console.log("topik:" + dataStore['navigation_button_night_state']);

			if (state == "true") {
				state = "On"
				lights.topic_switchOn();
				stata_name = lampOn;
			} 
			else {
				state = "Off";
				lights.topic_switchOff();
			} 

			// Create the Bulp button
			$('<div id="ext_nightmode"></div>').prependTo('body');	
			
			//Set the proper Bulp button
			$('#ext_nightmode').css('background-image', 'url(data:image/png;base64,' +  stata_name + '');

			// Add click event to Bulp button
			$('#ext_nightmode').click(function() {

				var state = mxstorage.getItem('navigation_button_night_state');

				if (state) {

					//Night mode ON
					$('#ext_nightmode').css('background-image', 'url(data:image/png;base64,' + lampOff + '');

					//Save in dataStore
					mxstorage.setItem('navigation_button_night_state', false);
					
					lights.topic_switchOff();
				} else {

					//Night mode Off
					$('#ext_nightmode').css('background-image', 'url(data:image/png;base64,' + lampOn + '');
					
					//Save in dataStore
					mxstorage.setItem('navigation_button_night_state', true);
					
					lights.topic_switchOn();
				}

				var data = mxstorage.getItem('navigation_button_night_state');

				// Save in localStorage
				rt.post("navigation_button_night_state", { name : "setSetting", key : 'navigation_button_night_state', val : data });
			});	
		};
		
		
		// Set the button positions
			
			// Gather visible buttons
			var buttons = new Array();
				
				if($('#ext_scrolltop').length) {
					buttons.push('ext_scrolltop');
				}

				if($('#ext_back').length) {
					buttons.push('ext_back');
				}

				if($('#ext_search').length) {
					buttons.push('ext_search');
				}

				if($('#ext_whitelist').length) {
					buttons.push('ext_whitelist');
				}

				if($('#ext_nightmode').length) {
					buttons.push('ext_nightmode');
				}

				if($('#ext_nav_faves').length) {
					buttons.push('ext_nav_faves');
				}
			
			// Reverse the array order for bottom positioning
			if(mxstorage.getItem('navigation_buttons_position').match('bottom')) {
				buttons = buttons.reverse();
			}
			
			// Calculate buttons height 
			var height = buttons.length * 36;
			
			// Calculate the top position
			var top = ( $(window).height() / 2 ) - ( height / 2);

			// Iterate over the buttons
			for(c = 0; c < buttons.length; c++) {
				
				if(mxstorage.getItem('navigation_buttons_position') == 'lefttop') {
				
					$('#'+buttons[c]).css({ left : 10, right : 'auto', top : 30 + (36*c), bottom : 'auto' });
				}

				if(mxstorage.getItem('navigation_buttons_position') == 'leftcenter') {
					
					$('#'+buttons[c]).css({ left : 10, right : 'auto', top : top + (36*c), bottom : 'auto' });
				}

				if(mxstorage.getItem('navigation_buttons_position') == 'leftbottom') {
				
					$('#'+buttons[c]).css({ left : 10, right : 'auto', bottom : 30 + (36*c), top : 'auto' });
				}

				if(mxstorage.getItem('navigation_buttons_position') == 'righttop') {
				
					$('#'+buttons[c]).css({ right : 10, left : 'auto', top : 50 + (36*c), bottom : 'auto' });
				}

				if(mxstorage.getItem('navigation_buttons_position') == 'rightcenter') {
					
					$('#'+buttons[c]).css({ right : 10, left : 'auto', top : top + (36*c), bottom : 'auto' });
				}

				if(mxstorage.getItem('navigation_buttons_position') == 'rightbottom') {

					$('#'+buttons[c]).css({ right : 10, left : 'auto', bottom : 30 + (36*c), top : 'auto' });
				}
			}
	},
	
	disabled : function() {
	
		$('#ext_scrolltop').remove();
		$('#ext_back').remove();
		$('#ext_search').remove();
		$('#ext_whitelist').remove();
		$('#ext_nav_faves').remove();
		$('#ext_nightmode').remove();
	},
	
	showSearch : function() {

		// Hide opened overlays
		show_navigation_buttons.removeOverlay();

		// Clone and append the original search form to body
		var clone = $('.std1:last').find('form').clone().appendTo('body'); /* $('.lapozo:last').next().next() nem működik*/
		
		// Add class
		clone.attr('id', 'ext_overlay_search');
		
		// Set position
		show_navigation_buttons.findArrowPosition( $('#ext_overlay_search_arrow'), $('#ext_search') );
		show_navigation_buttons.findPosition( $('#ext_overlay_search'), $('#ext_search') );
		
		// Show the elements
		$('#ext_overlay_search_arrow').show();
		$('#ext_overlay_search').show();
		
		// Create the hiding overlay
		show_navigation_buttons.createOverlay();
	},
	
	showFaves : function() {
		
		var url = "http://sg.hu/forum/";
		$('#ext_nav_faves_wrapper .ext_nav_fave_list').load(url + ' nav#favorites-list', function() {
						
			// Write data into wrapper
			$('#ext_nav_faves_wrapper .ext_nav_fave_list').html(data);
			
			if(mxstorage.getItem('jump_unreaded_messages') == 'true') {
				jump_unreaded_messages.activated();
			}
				
			// Hide topics that doesnt have unreaded messages
			fav_show_only_unreaded.activated();
					
			// Faves: short comment marker
			if(mxstorage.getItem('short_comment_marker') == 'true' ) {
				short_comment_marker.activated();
			}
			
			// Set position
			show_navigation_buttons.findArrowPosition( $('#ext_nav_faves_arrow'), $('#ext_nav_faves') );
			show_navigation_buttons.findPosition( $('#ext_nav_faves_wrapper'), $('#ext_nav_faves') );

			// Hide opened overlays
			show_navigation_buttons.removeOverlay();
						
			// Show the container
			$('#ext_nav_faves_wrapper').show();
			$('#ext_nav_faves_arrow').show();
			
			// Create the hiding overlay
			show_navigation_buttons.createOverlay();
		});
	},
	
	findArrowPosition : function(ele, target) {

		
		// Top
		if(mxstorage.getItem('navigation_buttons_position').match('bottom')) {
			var vPos = parseInt($(target).css('bottom').replace('px', '')) + $(target).height() / 2- $(ele).outerHeight() / 2;
		} else {
			var vPos = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2- $(ele).outerHeight() / 2;
		}
		
		// Left
		if(mxstorage.getItem('navigation_buttons_position').match('left')) {
			
			if(mxstorage.getItem('navigation_buttons_position').match('bottom')) {
				$(ele).css({ 'border-color' : 'transparent #c0c0c0 transparent transparent', top : 'auto', bottom : vPos, left : 30, right : 'auto' });
			} else {
				$(ele).css({ 'border-color' : 'transparent #c0c0c0 transparent transparent', top : vPos, bottom : 'auto', left : 30, right : 'auto' });
			}
		// Right
		} else {
			if(mxstorage.getItem('navigation_buttons_position').match('bottom')) {
				$(ele).css({ 'border-color' : 'transparent transparent transparent #c0c0c0', top : 'auto', bottom : vPos, left : 'auto', right : 30 });
			} else {
				$(ele).css({ 'border-color' : 'transparent transparent transparent #c0c0c0', top : vPos, bottom : 'auto', left : 'auto', right : 30 });
			}
		}
	},
	
	findPosition : function(ele, target) {

		
		if(mxstorage.getItem('navigation_buttons_position') == 'lefttop') {
			
			var top = parseInt($(target).css('top').replace('px', '')) - 15;

			$(ele).css({ left : 50, right : 'auto', top : top, bottom : 'auto' });
		}

		if(mxstorage.getItem('navigation_buttons_position') == 'leftcenter') {
			
			var top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2- $(ele).outerHeight() / 2;
			
			$(ele).css({ left : 50, right : 'auto', top : top, bottom : 'auto' });
		}

		if(mxstorage.getItem('navigation_buttons_position') == 'leftbottom') {
			
			var bottom = parseInt($(target).css('bottom').replace('px', '')) - 15;
			
			$(ele).css({ left : 50, right : 'auto', top : 'auto', bottom : bottom });
		}

		if(mxstorage.getItem('navigation_buttons_position') == 'righttop') {
			
			var top = parseInt($(target).css('top').replace('px', '')) - 15;

			$(ele).css({ left : 'auto', right : 50, top : top, bottom : 'auto' });
		}

		if(mxstorage.getItem('navigation_buttons_position') == 'rightcenter') {
			
			var top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2- $(ele).outerHeight() / 2;
			
			$(ele).css({ left : 'auto', right : 50, top : top, bottom : 'auto' });
		}

		if(mxstorage.getItem('navigation_buttons_position') == 'rightbottom') {
			
			var bottom = parseInt($(target).css('bottom').replace('px', '')) - 15;
			
			$(ele).css({ left : 'auto', right : 50, top : 'auto', bottom : bottom });
		}
	},
	
	createOverlay : function() {
		$('<div id="ext_nav_overlay"></div>').prependTo('body').css({ position : 'fixed', height : '100%', width : '100%', zIndex : 80 });
		$('#ext_nav_overlay').click(function() {
			show_navigation_buttons.removeOverlay();
		});
	},

	removeOverlay : function() {
		
		// Hide buttons overlays
		$('#ext_nav_faves_wrapper').hide();
		$('#ext_nav_faves_arrow').hide();
		
		$('#ext_overlay_search').remove();
		$('#ext_overlay_search_arrow').hide();
		
		// Remove the overlay
		$('#ext_nav_overlay').remove();
	}
};


var lights = {

	topic_switchOn : function() {

		var backgroundImg = "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";
	
		$('body').css('background-image', 'url(data:image/png;base64,' + backgroundImg+ ')');
		$('nav#menu-family').css({'color':'#807D7D'});		 
		$('#content').addClass('night_mainTable');
		$('.oldal-path-2').addClass('night_mainTable');
		$('header').addClass('night_topichead');
		$('section.body').addClass('night_p');
		$('li.forum-post a').css({'color':'#F0DC82 !important'});
		$('footer.footer').addClass('night_bottom')
		$('a.show-message').css({'color':'#CC7722 !important'});
		$('#footer-top').css({'opacity':'0.1'});
	},
	
	topic_switchOff : function() {
	
		$('body').css('background-image', '');
		$('nav#menu-family').css({'color':'black'});
		$('#content').removeClass('night_mainTable');
		$('.oldal-path-2').removeClass('night_mainTable');
		$('header').removeClass('night_topichead');
		$('section.body').removeClass('night_p');
		$('li.forum-post a').removeClass('night_p a');
		$('footer.footer').removeClass('night_bottom');
		$('a.show-message').removeClass('night_replyto');
	},

	forum_switchOn : function() {

		var backgroundImg = "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";
		var ext_hsep_bgImg = "iVBORw0KGgoAAAANSUhEUgAAAGYAAAABCAAAAAAJRYRcAAAACXBIWXMAAC4jAAAuIwF4pT92AAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAUSURBVHjaYmBgMKQDAgAAAP//AwBJGwaDzFV2OwAAAABJRU5ErkJggg==";

		$('body').css('background-image', 'url(data:image/png;base64,' + backgroundImg+ ')');
		$('#content').addClass('night_mainTable');

		//Chat
		/*setTimeout(function() {*/
		$('span, a, h4').css({'color':'rgb(119, 119, 119)'});
		$('span .new').css({'color':'darkred'});
		$('#forum-chat-input').css({'background':'black', 'color':'rgb(155, 155, 155)'});
		setTimeout(function() {
			$('ul#forum-chat-list li:odd').css({'background-color':'black'});
			$('ul#forum-chat-list li:even').css({'background-color':'#252525'});
		}, 2000);
		$('body').css({ 'background-image' : 'url(data:image/png;base64,' + ext_hsep_bgImg + ')' });
		$('#content').addClass('night_mainTable');

		//Chat
		/*setTimeout(function() {*/
		$('span, a, h4').css({'color':'rgb(119, 119, 119)'});
		$('span .new').css({'color':'darkred'});
		$('#forum-chat-input').css({'background':'black', 'color':'rgb(155, 155, 155)'});
		setTimeout(function() {
			$('ul#forum-chat-list li:odd').css({'background-color':'black'});
			$('ul#forum-chat-list li:even').css({'background-color':'#252525'});
		}, 2000);

	}
}

var update_fave_list = {

	activated : function() {

		// Disable site's built-in auto-update by remove "fkedvenc" ID
		$('#fkedvenc').removeAttr('id');
		
		// Create refhref button
		$('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<div id="ext_refresh_faves" style="display: inline-block;"></div>]</span>'); // ha lesz blokkok átrendezése, akkor #ext_left_sidebar után már nem kell inline style

		// Move the button away if unreaded faves is on
		if(mxstorage.getItem('fav_show_only_unreaded') == 'true' && isLoggedIn() ) {
			$('#ext_refresh_faves').css('right', 18);
		}

		// Refresh.png
		var refreshImg = "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";

		// Set refresh image
		$('<img src="data:image/png;base64,'+refreshImg+'">').appendTo('#ext_refresh_faves');
		
		// Add click event
		$('#ext_refresh_faves').click(function() {
			update_fave_list.refresh();
		});
		
		// Set up auto-update
		setInterval(function() {
			update_fave_list.refresh();
		}, 30000);
	},
	
	refresh : function() {
		
		var refreshImg = "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";
		var refreshWaitImg = "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";
		var refreshDoneImg = "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";

		// Set 'in progress' icon
		$('#ext_refresh_faves img').attr('src', 'data:image/png;base64,'+refreshWaitImg+'');	
		
		$( "nav#favorites-list" ).load( "http://sg.hu/forum/ nav#favorites-list", function() {

			// Set 'completed' icon
			$('#ext_refresh_faves img').attr('src', 'data:image/png;base64,'+refreshDoneImg+'');

			// Set back the normal icon in 1 sec
			setTimeout(function() {
				$('#ext_refresh_faves img').attr('src', 'data:image/png;base64,'+refreshImg+'');
			}, 2000);
			
			// Append new fave list
			$('.ext_faves:first').next().html(data);
			
			// Faves: show only with unreaded messages
			if(mxstorage.getItem('fav_show_only_unreaded') == 'true' && isLoggedIn() ) {
				fav_show_only_unreaded.activated();
			}

			// Faves: short comment marker
			if(mxstorage.getItem('short_comment_marker') == 'true' && isLoggedIn() ) {
				short_comment_marker.activated();
			}

			// Custom list styles
			if(mxstorage.getItem('highlight_forum_categories') == 'true') {
				highlight_forum_categories.activated();
			}

			// Jump the last unreaded message
			if(mxstorage.getItem('jump_unreaded_messages') == 'true' && isLoggedIn() ) {
				jump_unreaded_messages.activated();
			}

			//Night mode
			if (mxstorage.getItem('show_navigation_buttons_night') == 'true' && mxstorage.getItem('navigation_button_night_state') == 'true') {
				lights.forum_switchOn();
			}
		});
	}
};



var make_read_all_faves = {
	
	activated : function() {

		var markreadedImg = "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";

		// Create the 'read them all' button
		$('.ext_faves').append('<div id="ext_read_faves"><div>');

		// Move the button away if unreaded faves is on
		if(mxstorage.getItem('fav_show_only_unreaded') == true && isLoggedIn() ) {
			$('#ext_read_faves').css('right', 36);
		}

		// Append the image
		$('<img src="data:image/png;base64,'+markreadedImg+'">').appendTo('#ext_read_faves');

		// Add click event
		$('#ext_read_faves').click(function() {
			make_read_all_faves.makeread();
		});
	},
	
	makeread : function() {
		
		if(confirm('Biztos olvasottnak jelölöd az összes kedvenced?')) {

			var markreadedWaitingImg = "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";

			// Set 'in progress' icon
			$('#ext_read_faves img').attr('src', 'data:image/png;base64,'+markreadedWaitingImg+''); /* lehet torolni kene*/
			$('#ext_read_faves #icon').html('&#9684;');

			var count = 0;
			var counter = 0;

			// Get unreaded topics count
			$('.ext_faves').find('a').each(function() {
				
				// Dont bother the forum categories
				if( $(this).is('.category') ) {
					return true;
				}
				
				// Also dont bother readed topics
				if( $(this).hasClass('fav-not-new-msg') ){
					return true;
				}
				
				count++;
			});
			
			// Iterate over all faves
			$('.ext_faves').next().find('div a').each(function() {
				
				// Dont bother the forum categories
				if( $(this).is('.category') ) {
					return true;
				}
				
				// Also dont bother readed topics
				if( $(this).hasClass('fav-not-new-msg') ) {
					return true;
				}
				
				var ele = $(this);
				
				// Make an ajax query to refresh last readed time
				$.get( $(this).attr('href'), function() {
					
					$(ele).find('span.new').remove();
					$(ele).find('.ext_short_comment_marker').remove();
					
					if(mxstorage.getItem('fav_show_only_unreaded') == 'true' && fav_show_only_unreaded.opened == false) {
						$(ele).parent().addClass('ext_hidden_fave');
					}
					
					counter++;
				});
			});
			
			var interval = setInterval(function() {
				
				if(count == counter) {

					var markreadedImg = "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";
					var markreadedDoneImg = "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"

					// Set 'completed' icon
					$('#ext_read_faves img').attr('src', 'data:image/png;base64,'+markreadedDoneImg+'');

					// Set normal icon
					setTimeout(function() {
						$('#ext_read_faves img').attr('src', 'data:image/png;base64,'+markreadedImg+'');
					}, 2000);
					
					// Faves: show only with unreaded messages
					if(mxstorage.getItem('fav_show_only_unreaded') == 'true' && isLoggedIn() ) {
						fav_show_only_unreaded.activated();
					}

					// Reset faves newmsg vars
					if(mxstorage.getItem('jump_unreaded_messages') == 'true' && isLoggedIn() ) {
						jump_unreaded_messages.activated();
					}

					clearInterval(interval);
				}
				
			}, 100);
			
		}
	
	}
};

function replyTo() {
	$('.msg-replyto a').on('click', function(e) {
	
		// Prevent default submisson
		e.preventDefault();
		
		// Get original link params
		var _params = $(this).attr('href').match(/(msg)?\d+/g); 
		
		// Run replacement funciton
		ext_valaszmsg(_params[0], _params[1], _params[2], _params[3]); 
	});
}

function ext_valaszmsg(target, id, no, callerid) {
	
	if ($('#'+target).css('display') != 'block') {

		if(document.location.href.match('cikkek')) {
			var url = '/listazas_egy.php3?callerid=1&id=' + id + '&no=' + no;
		} else {
			var url = '/listazas_egy.php3?callerid=2&id=' + id + '&no=' + no;
		}

		$.get(url, function(data) { 

			// Show the comment
			$('#'+target).html(data).hide().slideDown();

			// Maintain style settings
			if(document.location.href.match('cikkek')) {
				$('#'+target).find('.b-h-o-head a').closest('.b-h-o-head').attr('class', 'b-h-o-head topichead');
				$('#'+target).find('.b-h-o-head').css('background', 'url(images/ful_o_bgbg.gif)');
				$('#'+target).find('.b-h-o-head .msg-dateicon a').css('color', '#444');
			}

			// show menitoned comment
			if(mxstorage.getItem('show_mentioned_comments') == 'true') {
				show_mentioned_comments.activated();
			}

			if(mxstorage.getItem('disable_point_system') == 'true') {
				disable_point_system.activated();
			}

			// Set-up block buttons
			add_to_list.init();

			if(mxstorage.getItem('profiles') != '') {
				profiles.init();
			}

			if(mxstorage.getItem('columnify_comments') == 'true') {

				columnify_comments.activated();
			}

			if(mxstorage.getItem('quick_user_info') == 'true') {
				quick_user_info.activated();
			}

			if (mxstorage.getItem('show_navigation_buttons_night') == 'true' && mxstorage.getItem('navigation_button_night_state') == 'true') {
				lights.topic_switchOn();
			}

		});
	}
	else { $('#'+target).slideUp(); }
}

var overlay_reply_to = {
	
	opened : false,
	
	activated : function() {
	
		// Change tabindexes for suit the overlay textarea
		$('textarea:first').attr('tabindex', '3');
		$('textarea:first').closest('div').find('a:last').attr('tabindex', '4');
		
		// Change the behavior the replyto button
		$('li[id*=post] header a:contains("válasz")').on('click', function(e) {
			
			// Prevent default submission
			e.preventDefault();

			// Get ref msg ID and comment element
			var msgno = $(this).closest('header').find('a.post-no').text().match(/\d+/g);
			var entry = $(this).closest('li');

			// Call show method
			overlay_reply_to.show(entry, msgno);
		});
	},
	
	disabled : function() {
	
		$('li[id*=post] header a:contains("válasz")').off('click');
	
	},
	
	show : function(comment, msgno) {

		// Return when the user is not logged in
		if(!isLoggedIn()) { alert('Nem vagy bejelentkezve!'); return; }
		
		// Prevent multiple instances
		if(overlay_reply_to.opened) {
			return false;
		
		// Set opened status
		} else {
			overlay_reply_to.opened = true;
		}
		
		// Create the hidden layer
		$('<div class="ext_hidden_layer"></div>').prependTo('body').hide().fadeTo(300, 0.9);
		
		// Highlight the reply comment
		var comment_clone = $(comment).clone().prependTo('#forum-posts-list').addClass('ext_highlighted_comment');
		
		// Maintain comment clone positions
		comment_clone.css({ 'top' : comment.offset().top });
		
		// Remove threaded view padding and border
		comment_clone.css({ margin : 0 , padding : 0, border : 0 });
		
		// Remove 'msg for me' indicator
		comment_clone.find('.ext_comments_for_me_indicator').remove();
		
		// Remove sub-center tags
		comment_clone.find('ul.post-answer').remove();
		
		// Remove quoted subcomments
		comment_clone.find('ul.post-answer').remove(); /*.parent('div') */ 
		
		if(document.location.href.match('cikkek')) {
			comment_clone.css('width', 700);
		}
		
		// Create textarea clone
		
		// WYSIWYG editor
		if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			
			/*if(document.location.href.match('cikkek')) {
			
				var textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body');
				$('form[name="newmessage"]').clone(true, true).prependTo('.ext_clone_textarea:first');

				// Add 'article' class to the clone
				textarea_clone.addClass('article');
					
				// Remove username line
				textarea_clone.find('b').remove();
					
				// Maintain style settings 
				textarea_clone.find('div:first').removeAttr('id');
				
				// Remove div padding
				textarea_clone.find('form div div').css('padding', 0);

			} else {
				var textarea_clone = $('form[name="newmessage"]').closest('div').clone(true, true).prependTo('body').addClass('ext_clone_textarea');
		
				// Add 'article' class to the clone
				textarea_clone.addClass('topic');
				
				// Remove username
				textarea_clone.find('.std1').remove();
				
				// Remove div padding
				textarea_clone.find('form div:eq(0)').css('padding', 0);
			}
			
			textarea_clone.find('.cleditorMain').remove();
			textarea_clone.find('form div:eq(0)').append('<textarea cols="50" rows="10" name="message"></textarea>');

			// Copy textarea original comment to the tmp element
			textarea_clone.find('textarea').val( $('form[name=newmessage]:gt(0) textarea').val() );

				
			// Apply some styles
			textarea_clone.css({'background' : 'none', 'border' : 'none' });


			// Fix buttons
			textarea_clone.find('a:eq(0)').css({ position : 'absolute', top : 220, left : 0 });
			textarea_clone.find('a:eq(1)').css({ position : 'absolute', top : 220, left : 90, visibility : 'visible' });
			textarea_clone.find('a:eq(2)').css({ display: 'none' });
			textarea_clone.find('a:eq(3)').css({ display: 'none' });
			textarea_clone.find('a:eq(4)').css({ position : 'absolute', top : 220, left : 180 });
			textarea_clone.find('a:eq(5)').css({ position : 'absolute', top : 220, left : 270, right : 'auto' });

			if(mxstorage.getItem('spoiler_button') == 'true') {
//				textarea_clone.find('a:eq(1)').css({ left : 360 });
				textarea_clone.find('a:eq(6)').css({ position : 'absolute', top : 220, left : 90 }); //spoiler button 360
				textarea_clone.find('a:eq(7)').css({ position : 'absolute', top : 220, right : 0 });
			} else {
				textarea_clone.find('a:eq(6)').css({ position : 'absolute', top : 220, right : 0 });
			}
				
			// Fix smile list
			if(document.location.href.match('cikkek')) {
				textarea_clone.find('#ext_smiles').css({ 'padding-left' : 50, 'padding-right' : 50, 'margin-top' : 20 });
			} else {
				textarea_clone.find('#ext_smiles').css({ 'padding-left' : 100, 'padding-right' : 100, 'margin-top' : 15 });
			}
			textarea_clone.find('.ext_smiles_block h3').css('color', 'black');
			
			// CLEditor init
			if(document.location.href.match('cikkek')) {
				$(".ext_clone_textarea textarea").cleditor({ width : 696, height: 200 })[0].focus();
				textarea_clone.find('.cleditorMain').css({ position : 'relative', top : -10 });
			} else {
				$(".ext_clone_textarea textarea").cleditor({ width : 800 })[0].focus();
			}*/

		
		// Normal textarea
		} else {
		
				
			if(document.location.href.match('cikkek')) {

				var textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body');
				$('form[name="newmessage"]').clone(true, true).prependTo('.ext_clone_textarea:first');


				// Add 'article' class to the clone
				textarea_clone.addClass('article');
					
				// Remove username line
				textarea_clone.find('b').remove();
					
				// Maintain style settings 
				textarea_clone.find('div:first').removeAttr('id');

				// Create a container element around the textarea for box-shadow
				$('<div id="ext_clone_textarea_shadow"></div>').insertAfter(textarea_clone.find('textarea'));
				
				// Put textarea the container
				textarea_clone.find('textarea').appendTo('#ext_clone_textarea_shadow');
									
			} else {
	
				var textarea_clone = $('form[name="newmessage"] textarea').closest('form').clone(true, true).prependTo('body').addClass('ext_clone_textarea');

				// Add 'topic' class to the clone
				textarea_clone.addClass('topic');
					
				// Remove username line
				textarea_clone.find('#comments-login').remove();
			
				// Create a container element around the textarea for box-shadow
				$('<div id="ext_clone_textarea_shadow"></div>').insertAfter(textarea_clone.find('textarea'));
				
				// Put textarea the container
				textarea_clone.find('textarea').appendTo('#ext_clone_textarea_shadow');		
			}
		
			// Copy textarea original comment to the tmp element
			textarea_clone.find('textarea').val( $('form[name=newmessage]:gt(0) textarea').val() );

			// Fix buttons
			textarea_clone.find('button:eq(1)').css({ position : 'absolute',  left : 0 });
			textarea_clone.find('button:eq(2)').css({ position : 'absolute',  left : 90 });  //90   // Makrók 90
			textarea_clone.find('button:eq(3)').css({ position : 'absolute',  left : 180 }); //180  
			textarea_clone.find('button:eq(4)').css({ position : 'absolute',  left : 270 }); //270  
			textarea_clone.find('button:eq(5)').css({ position : 'absolute',  left : 371 }); //360  
			textarea_clone.find('button:eq(6)').css({ position : 'absolute',  left : 471 }); //450  
			textarea_clone.find('button:eq(7)').css({ position : 'absolute',  left : 583 }); //450  

			if(mxstorage.getItem('spoiler_button') == 'true') {
				textarea_clone.find('a:eq(1)').css({ position : 'absolute', left : 540 });
				textarea_clone.find('a:eq(6)').css({ position : 'absolute', left : 90 , 'margin-left' : 0 }); //spoiler button 360
				textarea_clone.find('a:eq(7)').css({ position : 'absolute', right : 0 });
			} else {
				textarea_clone.find('a:eq(6)').css({ position : 'absolute', right : 0 });
			}
		}
		
		// Textarea position
		var top = $(comment_clone).offset().top + $(comment_clone).height();
		
		if(document.location.href.match('cikkek')) {
			var left = $(document).width() / 2 - 350;
		} else {
			var left = $(document).width() / 2 - 405;
		}

			textarea_clone.delay(350).css({ top : top + 200, left : left, opacity : 0 }).animate({ top : top + 10, opacity : 1 }, 300);
			
		// Change textarea name attr to avoid conflicts
		$('form[name=newmessage]:gt(0)').attr('name', 'tmp');
		
		// Set msg no input
		textarea_clone.find('input[name=no_ref]').attr('value', msgno);
		
		// Autoscroll
		var pageBottom	= $(window).scrollTop() + $(window).height();
		var textBottom 	= $('.ext_clone_textarea').offset().top + $('.ext_clone_textarea').height();

		if(textBottom > pageBottom) { 
			var scT = textBottom - $(window).height() + 50;
			$('body').animate( { scrollTop : scT }, 500);
		}

		// Set the right tabindex
		textarea_clone.find('textarea').attr('tabindex', '1');
		textarea_clone.find('a:last').attr('tabindex', '2');

		// Set the textarea focus
		textarea_clone.find('textarea').focus();
		
		// Set the iframe focus
		if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			textarea_clone.find('iframe')[0].focus();
		}

		// Block default tab action in non-WYSIWYG editor
		$('body').keydown(function(event) {
			if (event.keyCode == '9') {
    			 event.preventDefault();
    			 textarea_clone.find('a:last').focus();
   			}
		});

		// Block default tab action in a WYSIWYG editor
		/*if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			$(textarea_clone.find('iframe')[0].contentDocument.body).keydown(function(event) {
				if (event.keyCode == '9') {
    				 event.preventDefault();
    				 textarea_clone.find('a:last').focus();
   				}
			});
		}*/
		
		// Thickbox
		textarea_clone.find('a.thickbox').each(function() {
			
			// Get the title and other stuff
			var t = $(this).attr('title') || $(this).attr('name') || null;
			var g = $(this).attr('rel') || false;
			var h = $(this).attr('href');
			
			$(this).attr('href', 'javascript:TB_show(\''+t+'\',\''+h+'\','+g+');');
			
			$(this).blur();
		});
	
		var closeBtmImg = "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";

		// Add close button
		var close_btm = $('<img src="data:image/png;base64,'+closeBtmImg+'" id="ext_close_overlay">').prependTo(textarea_clone).addClass('ext_overlay_close');

		// Change close button position if WYSIWYG editor is disabled
		/*if(mxstorage.getItem('wysiwyg_editor') != true) {
			close_btm.css({ 'right' : 4, 'top' : 9 });
		}*/

		// Add Close event
		$(close_btm).click(function() {
			$(textarea_clone).fadeTo(100, 0, function() {
				$(this).remove();
				$(comment_clone).fadeTo(100, 0, function() {
					$(this).remove();
					$('.ext_hidden_layer').fadeTo(300, 0, function() {
						$(this).remove();
						$('form[name=tmp]:first').attr('name', 'newmessage');
						
						// Set back opened status
						overlay_reply_to.opened = false;
						
						// Remove keydown event
						$('body').unbind('keydown');
					});
				});
			});
		});
	}
};

var highlight_comments_for_me = {
	
	
	activated : function() {
	
		// Return false when no username set
		if(userName == '') {
			return false;
		}
	
		var commentsForMeIndicatorImg = "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";

		// Get the proper domnodes
		var comment = $('li[id*="post"] footer a:contains("' + userName + '")');

		//We need exact match with the userName
		var start_pos   = comment.text().indexOf('\'') + 1;
		var end_pos     = comment.text().indexOf('\'',start_pos);
		var TesTcomment = comment.text().substring(start_pos, end_pos);
		
		if (TesTcomment == userName) {
			var comments = comment.closest('center');
    	};
	
		if (comments != undefined) {

			// Iterate over them
			comments.each(function() {

				if($(this).find('.ext_comments_for_me_indicator').length == 0) {
					
					$(this).css('position', 'relative').append('<img src="data:image/png;base64,'+commentsForMeIndicatorImg+'" class="ext_comments_for_me_indicator">');

					if(document.location.href.match('cikkek')) {
						$(this).find('.ext_comments_for_me_indicator').addClass('article');
					} else {
						$(this).find('.ext_comments_for_me_indicator').addClass('topic');
					}			
				}
			});
		};
	},
	
	disabled : function() {
	
		$('.ext_comments_for_me_indicator').remove();
	}	
};


var threaded_comments = {
	
	activated : function() {
		// New message counter
		var newMsg = document.location.href.split('&newmsg=')[1];

		// Mark new messages if any
		if(typeof newMsg != "undefined" && newMsg != '') {
			$('.topichead:lt('+newMsg+')').find('a:last').after( $('<span class="thread_sep"> | </span> <span class="ext_new_comment" style="color: red;">ÚJ</span>') );
		}
	
		// Set prev and next button if any new messages
		if(newMsg > 0) {
			
			$('<span class="thread_prev">&laquo;</span>').insertBefore( $('.ext_new_comment') );
			$('<span class="thread_next">&raquo;</span>').insertAfter( $('.ext_new_comment') );
			
			// Bind events
			$('.thread_prev').on('click', function() {
				threaded_comments.prev(this);
			});

			$('.thread_next').on('click', function() {
				threaded_comments.next(this);
			});
		}
		
		// Sort comments to thread
		threaded_comments.sort();
	},


	prev : function(ele) {
		
		// Get the index value of the current element
		var index = $(ele).index('.thread_prev');
		
		// Check if is it the first element
		if(index == 0) {
			return false;
		}
		
		var target = $('.ext_new_comment').eq((index-1)).closest('center').children('table');
		
		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);
		
		// Scroll to target element
		$('body').animate({ scrollTop : targetOffset}, 500);
	},
	
	next : function(ele) {
		
		// Get the index value of the current element
		var index = $(ele).index('.thread_next');
		
		// Check if is it the last element
		if(index+1 >= $('.ext_new_comment').length) {
			return false;
		}
		
		var target = $('.ext_new_comment').eq((index+1)).closest('center').children('table');

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);
		
		// Scroll to target element
		$('body').animate({ scrollTop : targetOffset}, 500);
	},
	
	sort : function() {

		// Sort to thread
		$( $('.topichead:not(.checked)').closest('center').get().reverse() ).each(function() {
		
			// Check if theres an answered message
			if($(this).find('.msg-replyto a').length == 0) {
			
				// Add checked class
				$(this).find('.topichead:first').addClass('checked');
				
				// Return 'true'
				return true;
			}
		
			// Get answered comment numer
			var commentNum = $(this).find('.msg-replyto a').html().split('#')[1].match(/\d+/g);
			
			
			// Seach for parent node via comment number
			$( $(this) ).appendTo( $('.topichead a:contains("#'+commentNum+'"):last').closest('center') );
		
			// Set style settings
			if(document.location.href.match('cikkek')) {
				$(this).css({ 'margin-left' : 0, 'padding-left' : 30, 'border-left' : '1px solid #ddd' });
				$(this).find('.topichead').parent().css('width', 700 - $(this).parents('center').length * 30);
				$(this).find('.msg-replyto').hide();
			} else {
				$(this).css({ 'margin-left' : 15, 'padding-left' : 15, 'border-left' : '1px solid #ddd' });
				$(this).find('.topichead').parent().css('width', 810 - ($(this).parents('center').length-2) * 30);
				$(this).find('.msg-replyto').hide();			
			}
			
			// Add checked class
			$(this).find('.topichead:first').addClass('checked');

		});
	}
};


var fetch_new_comments_in_topic = {
	
	counter : 0,
	last_new_msg : 0,
	locked : false,
	
	init : function() {
		
		if($('#ujhszjott').length == 0) {
			return false;
		}
		
		// Set new messages number to zero
		$('#ujhszjott a').html('0 új hozzászólás érkezett!');
		
		// Hide the notification when fetch new comments settgngs is enabled
		if(mxstorage.getItem('fetch_new_comments') == 'true') {
			$('#ujhszjott').css({ display : 'none !important', visibility : 'hidden', height : 0, margin : 0, padding : 0, border : 0 });
		}
		
		// Monitor new comments nofification 
		setInterval(function(){
			
			// Get new comments counter
			var newmsg = parseInt($('#ujhszjott a').text().match(/\d+/g));
			
			if(newmsg > fetch_new_comments_in_topic.last_new_msg && fetch_new_comments_in_topic.locked == false) {
				
				// Rewrite the notification url
				fetch_new_comments_in_topic.rewrite();
				
				// Fetch the comments if this option is enabled
				// Set locked status to prevent multiple requests
				if(mxstorage.getItem('fetch_new_comments') == 'true') {
					fetch_new_comments_in_topic.locked = true;
					fetch_new_comments_in_topic.fetch();
				}
			}
		}, 1000);
	},
	
	rewrite : function() {
	
		var topic_url = $('#ujhszjott a').attr('href').substring(0, 27);
		var comment_c = $('#ujhszjott a').text().match(/\d+/g);
			
		$('#ujhszjott a').attr('href',  topic_url + '&newmsg=' + comment_c);
	},
	
	fetch : function() {
		
		// Check the page number
		var page = parseInt($('.lapozo:last span.current:first').html());
		
		// Do nothing if we not in the first page
		if(page != 1) {
			return false;
		}
		
		// Get new comments counter
		var newmsg = parseInt($('#ujhszjott a').text().match(/\d+/g));
		
		// Update the newmsg
		var new_comments = newmsg - fetch_new_comments_in_topic.last_new_msg;
		
		// Update the last new msg number
		fetch_new_comments_in_topic.last_new_msg = newmsg;
		
		// Get the topik ID and URL
		var id = $('select[name="id"] option:selected').val();
		var url = 'listazas.php3?id=' + id;
		
		// Get topic contents
		$.ajax({
			url : url,
			mimeType : 'text/html;charset=iso-8859-2',
			success : function(data) {

				// Increase the counter
				fetch_new_comments_in_topic.counter++;
				
				// Append horizonal line
				if(fetch_new_comments_in_topic.counter == 1) {
					$('<hr>').insertAfter( $('.std1:first').parent() ).addClass('ext_unreaded_hr');
				}
				
				// Parse the content
				var tmp = $(data);
				
				// Fetch new comments
				var comments = $(tmp).find('.topichead:lt('+new_comments+')').closest('center');

				// Append new comments
				$(comments.get().reverse()).each(function() {
					$(this).insertAfter( $('.std1:first').parent() );
				});
				
				// Remove locked status
				fetch_new_comments_in_topic.locked = false;

				// Reinit settings

					// Set-up block buttons
					add_to_list.init();

					// highlight_comments_for_me
					if(mxstorage.getItem('highlight_comments_for_me') == 'true' && isLoggedIn()) {
						highlight_comments_for_me.activated();
					}
				
					// show menitoned comment
					if(mxstorage.getItem('show_mentioned_comments') == 'true') {
						show_mentioned_comments.activated();
					}

					// User profiles
					if(mxstorage.getItem('profiles') != '') {
						profiles.init();
					}

					//Quick user info button
					if(mxstorage.getItem('quick_user_info') == 'true') {
						quick_user_info.activated();
					}

					//
					if (mxstorage.getItem('show_navigation_buttons_night') == 'true' && mxstorage.getItem('navigation_button_night_state') == 'true') {
						lights.topic_switchOn();
					}
			}
		});
	}
};



/*var show_mentioned_comments = {

	activated : function() {

		$('a[href*="hszmutat"]:not(.checked)').each(function() {
			
			// Remove original event
			$(this).attr('class', 'ext_mentioned').addClass('checked');
		});
		
		// Attach click events
		$('.ext_mentioned').unbind('click').click(function(e) {
		
			// Prevent browser default submission
			e.preventDefault();
			
			// Call the show method
			show_mentioned_comments.show(this);
		});
	},
	
	show : function(ele) {
		
		// Get comment number
		var no = $(ele).html().match(/\d+/g);
		
		if(document.location.href.match('cikkek')) {
		
			var id = $('.std2 a').attr('href').split('?id=')[1];
		
		} else {
	
			// Get topic ID
			var id = document.location.href.split('?id=')[1];
				id = id.split('#')[0];
				id = id.split('&')[0];
		}

		var target = $(ele).next().attr('id');
		
		if(document.location.href.match('cikkek')) {
			eval("ext_valaszmsg('"+target+"', "+id+", "+no+", 1);");
		} else {
			eval("ext_valaszmsg('"+target+"', "+id+", "+no+", 2);");
		}
	}
};*/


var custom_blocks = {
	
	activated : function() {
	
		// Set blocks IDs
		custom_blocks.setIDs();
		
		// Check localStorage for config
		if( typeof mxstorage.getItem('blocks_config') == 'undefined' || mxstorage.getItem('blocks_config') == '') {
			custom_blocks.buildConfig();
		}
		
		// Execute config
		custom_blocks.executeConfig();

		
		// Set overlays
		if(mxstorage.getItem('hide_blocks_buttons') == 'false' || typeof mxstorage.getItem('hide_blocks_buttons') == 'undefined') {
			custom_blocks.setOverlay();
		}
	
	},
	
	disabled : function() {
	
		$('.ext_blocks_buttons').remove();
	},
	
	setIDs : function() {
		
		// Blocks counter
		var counter = 1;
		
		// Left side blocks
		$('#ext_left_sidebar .b-h-o-head, #ext_right_sidebar .b-h-b-head').parent().each(function() {
			
			// Set the ID
			$(this).attr('class', 'ext_block').attr('id', 'block-'+counter);
			
			// Increase the counter
			counter++;
		});
	},
	
	buildConfig : function() {
		
		// Var for config
		var config = [];
		
		// Iterate over the blocks
		$('.ext_block').each(function(index) {
			
			var tmp = {
				
				id 			: $(this).attr('id'),
				visibility	: true,
				contentHide	: false,
				side		: $(this).find('.b-h-o-head').length > 0 ? 'left' : 'right',
				index 		: index
			};
			
			config.push(tmp);
			
		});


		// Store in localStorage
		rt.post("setBlocksConfig", { name : "setBlocksConfig", message : JSON.stringify(config) });
		
		// Update in dataStore var
		mxstorage.setItem('blocks_config', JSON.stringify(config));
	},
	
	
	setConfigByKey : function(id, key, value) {
		
		var config = JSON.parse(mxstorage.getItem('blocks_config'));
		
		for(c = 0; c < config.length; c++) {

			if(config[c]['id'] == id) {
				config[c][key] = value;
			}
		}
	
		// Store in localStorage
		rt.post("setBlocksConfig", { name : "setBlocksConfig", message : JSON.stringify(config) });
		
		// Update dataStore var
		mxstorage.setItem('blocks_config', JSON.stringify(config));
	},
	
	getConfigValByKey : function(id, key) {
	
		var config = JSON.parse(mxstorage.getItem('blocks_config'));
		
		for(c = 0; c < config.length; c++) {

			if(config[c]['id'] == id) {
				return config[c][key];
			}
		}
	},
	
	reindexOrderConfig : function() {

		// Var for config
		var config = JSON.parse(mxstorage.getItem('blocks_config'));
		var _config = [];
		
		// Iterate over the blocks
		$('.ext_block').each(function(index) {
			
			var tmp = {
				
				id 			: $(this).attr('id'),
				visibility	: custom_blocks.getConfigValByKey($(this).attr('id'), 'visibility'),
				contentHide	: custom_blocks.getConfigValByKey($(this).attr('id'), 'contentHide'),
				side		: $(this).find('.b-h-o-head').length > 0 ? 'left' : 'right',
				index 		: index
			};
			
			_config.push(tmp);
			
		});

		
		// Store in localStorage
		rt.post("setBlocksConfig", { name : "setBlocksConfig", message : JSON.stringify(_config) });
	},
	
	executeConfig : function() {

		var config = JSON.parse(mxstorage.getItem('blocks_config'));

		// Maxthon fix
		if (config != null) {
			config = config.reverse();

			for(c = 0; c < config.length; c++) {

				// Visibility
				if( config[c]['visibility'] == false ) {
					custom_blocks.hide(config[c]['id'], false);
				}

				// ContentHide
				if( config[c]['contentHide'] == true ) {
					custom_blocks.contentHide(config[c]['id'], false);
				}
				
				// Side and pos
				if( config[c]['side'] == 'left' ) {
					
					$('#'+config[c]['id']).prependTo('table:eq(3) td:eq(0)');
					
				} else {
					
					$('#'+config[c]['id']).prependTo('table:eq(3) td:eq(2) table:first tr > td:eq(2)');
				}
			}
		};
			

		
		// Maintain style settings
		$('#ext_left_sidebar').find('.b-h-b-head').removeClass('b-h-b-head').addClass('b-h-o-head');
		$('#ext_left_sidebar').find('.hasab-head-b').removeClass('hasab-head-b').addClass('hasab-head-o');
		$('#ext_left_sidebar').find('img[src="images/ful_b_l.png"]').attr('src', 'images/ful_o_l.png');

		// Maintain style settings
		$('#ext_right_sidebar').find('.b-h-o-head').removeClass('b-h-o-head').addClass('b-h-b-head');
		$('#ext_right_sidebar').find('.hasab-head-o').removeClass('hasab-head-o').addClass('hasab-head-b');
		$('#ext_right_sidebar').find('img[src="images/ful_o_l.png"]').attr('src', 'images/ful_b_l.png');
		
		
		// Fix welcome block for private messages
		$('.ext_welcome:first').next().find('br').css('display', 'inline');
	
	},
	
	setOverlay : function() {

		$('.ext_block').each(function() {
			
			var item = $('<p class="ext_blocks_buttons"></p>').prependTo(this);

			var minimalizeImg = "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";
			var closeImg = "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";
			var downImg = "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";
			var upImg = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAGFJREFUeNrEk8ENgDAMA11G6GzZ0puxhPlEPAopaRDCkp8X+R5pkvAmGz6OeUvpAHZvrxwgAHlZma6htjp9PJBW4Q2cVrEJ/KgSTU+rMAGHKrYAX1Sy00MVFuBTpf3+jccA9lJliS+/A+0AAAAASUVORK5CYII=";
			var rightImg = "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";
			var leftImg = "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";

			// Contenthide
			$('<img src="data:image/png;base64,'+minimalizeImg+'" class="ext_block_button_right">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.contentHide( $(this).closest('div').attr('id'), true );
			});

			// Hide
			$('<img src="data:image/png;base64,'+closeImg+'" class="ext_block_button_right">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.hide( $(this).closest('div').attr('id'), true );
			});


			// Down
			$('<img src="data:image/png;base64,'+downImg+'" class="ext_block_button_left">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.down( $(this).closest('div').attr('id'), true );
			});

			// Up
			$('<img src="data:image/png;base64,'+upImg+'" class="ext_block_button_left">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.up( $(this).closest('div').attr('id'), true );
			});						

			// Right
			$('<img src="data:image/png;base64,'+rightImg+'" class="ext_block_button_left">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.right( $(this).closest('div').attr('id'), true );
			});			
			// Left
			$('<img src="data:image/png;base64,'+leftImg+'" class="ext_block_button_left">').prependTo(item).click(function(e) {
				e.preventDefault();
				custom_blocks.left( $(this).closest('div').attr('id'), true );
			});

		});
	},
	
	hide : function(id, clicked) {
		
		if(clicked == true) {
			// Change the config
			custom_blocks.setConfigByKey( id, 'visibility', false);
		
			// Hide the item
			$('#'+id).slideUp(200);
		} else {
			$('#'+id).hide();
		}
	},
	
	contentHide : function(id, clicked) {
		
		if(clicked == false) {
			$('#'+id).children('div:eq(1)').hide();
			return true;
		}
		
		if( $('#'+id).children('div:eq(1)').css('display') == 'none' ) {
		
			// Change the config
			custom_blocks.setConfigByKey( id, 'contentHide', false);
		
			// Hide the item
			$('#'+id).children('div:eq(1)').show();
		
		} else {

			// Change the config
			custom_blocks.setConfigByKey( id, 'contentHide', true);
		
			// Hide the item
			$('#'+id).children('div:eq(1)').hide();
		}
	},
	
	left : function(id) {
		
		// Check current side settings
		if($('#'+id).find('.b-h-o-head').length == 0) {
		
			// Move the block
			$('#'+id).prependTo('#ext_left_sidebar');

			// Maintain style settings
			$('#ext_left_sidebar').find('.b-h-b-head').removeClass('b-h-b-head').addClass('b-h-o-head');
			$('#ext_left_sidebar').find('.hasab-head-b').removeClass('hasab-head-b').addClass('hasab-head-o');
			$('#ext_left_sidebar').find('img[src="images/ful_b_l.png"]').attr('src', 'images/ful_o_l.png');
		
			// Store data in localStorage
			custom_blocks.reindexOrderConfig();
		}
	},

	right : function(id) {
		
		// Check current side settings
		if($('#'+id).find('.b-h-b-head').length == 0) {
		
			// Move the block
			$('#'+id).prependTo('#ext_right_sidebar');

			// Maintain style settings
			$('#ext_right_sidebar').find('.b-h-o-head').removeClass('b-h-o-head').addClass('b-h-b-head');
			$('#ext_right_sidebar').find('.hasab-head-o').removeClass('hasab-head-o').addClass('hasab-head-b');
			$('#ext_right_sidebar').find('img[src="images/ful_o_l.png"]').attr('src', 'images/ful_b_l.png');
	
			// Store data in localStorage
			custom_blocks.reindexOrderConfig();
		}
	},
	
	up: function(id) {
		
		// Get index val
		var index = $('#'+id).index('.ext_block');

		// Current position
		if( $('#'+id).closest('#ext_left_sidebar').length > 0 ) {
		
			if(index == 0) {
				return false;
			}
		
		} else {

			var first = $('#ext_left_sidebar .ext_block').length;
			if(index == first) {
				return false;
			}
		}
		
		// Move to target
		$('#'+id).insertBefore('.ext_block:eq('+(index-1)+')');		

		// Store data in localStorage
		custom_blocks.reindexOrderConfig();
	},
	
	down : function(id) {

		// Get index val
		var index = $('#'+id).index('.ext_block');
		
		// Current position
		if( $('#'+id).closest('#ext_left_sidebar').length > 0 ) {
			
			var last = $('#ext_left_sidebar .ext_block').length - 1;
			
			if(last == index) {
				return false;
			}
		}
		
		// Move to target
		$('#'+id).insertAfter('.ext_block:eq('+(index+1)+')');

		// Store data in localStorage
		custom_blocks.reindexOrderConfig();
	}
};

var remove_adds = {

	activated : function() {

		// Home facebook widget
		$('#forum-fb-likebox').remove();
				
	},
};

var wysiwyg_editor = {

	activated : function() {
		
		// Rearrange buttons
		if(document.location.href.match('cikkek')) {
		
			// Remove username
			$('form[name="newmessage"] b').remove();		
		
			// CLEditor init
			$('textarea[name="message"]').cleditor({ width: 660 });
		
		} else {

			// CLEditor init
			$('textarea[name="message"]').cleditor();
		}
 
		
		$('form[name="newmessage"]').css('position', 'relative');
		$('form[name="newmessage"] a:eq(0)').css({ 'position' : 'absolute', 'left' : 20  });
		$('form[name="newmessage"] a:eq(1)').css({ 'position' : 'absolute', 'left' : 110 }); // 380
		$('form[name="newmessage"] a:eq(2)').css('visibility', 'hidden');
		$('form[name="newmessage"] a:eq(3)').css('visibility', 'hidden');
		$('form[name="newmessage"] a:eq(4)').css({ 'position' : 'absolute', 'left' : 200 });
		$('form[name="newmessage"] a:eq(5)').css({ 'position' : 'absolute', 'left' : 290 });
		$('form[name="newmessage"] a:eq(6)').css({ 'position' : 'absolute', 'right' : 22 });	

		// Insert video
		$('form[name="newmessage"] a:eq(4)').click(function(e) {
			e.preventDefault();

			var thisTitle="";
			
			
			var thisURL = prompt("Add meg a beszúrandó video URL-jét!  (pl.: http://www.youtube.com/watch?v=sUntx0pe_qI)", "http://www.youtube.com/watch?v=sUntx0pe_qI");

			if (thisURL && (((thisURL.length>25 && thisURL.substring(0,20) == "http://www.youtu.be/") || (thisURL.length>25 && thisURL.substring(0,16) == "http://youtu.be/") || thisURL.length>25 && thisURL.substring(0,25) == "http://www.youtube.com/v/") || (thisURL.length>31 && thisURL.substring(0,31) == "http://www.youtube.com/watch?v="))) {
					
				var maxurlhossz = thisURL.search("&");
					
				if (maxurlhossz === -1) {
						maxurlhossz = 2000; 
				}

				kezdhossz=31;
					
				if (thisURL.substring(0,25)=="http://www.youtube.com/v/") {
					kezdhossz=25;
					
				} else if (thisURL.substring(0,16)=="http://youtu.be/") {
					kezdhossz=16;
					
				} else if (thisURL.substring(0,20)=="http://www.youtu.be/") {
					kezdhossz=20;
				}
              	
				var videocode = "[flash]http://www.youtube.com/v/"+thisURL.substring(kezdhossz,maxurlhossz)+"&fs=1&rel=0&color1=0x4E7AAB&color2=0x4E7AAB[/flash]";

				var imod = $(".cleditorMain:first iframe").contents().find('body').html() + videocode;
				$('.cleditorMain:first iframe').contents().find('body').html(imod);

				// Without this, sometimes it doesn't insert the video link into the WYSIWYG editor
				var tarea = $('textarea[name="message"]:first').val() + videocode;
				$('textarea[name="message"]:first').val(tarea);
			}

		});
		
		// Create smiles container
		$('<div id="ext_smiles"></div>').appendTo('form[name="newmessage"]');
		
		// Add click event to show or hide smile list
		$('form[name="newmessage"] a:eq(0)').toggle(
			function(e) {
				e.preventDefault();
				$('#ext_smiles').slideDown();
			},
			
			function(e) {
				e.preventDefault();
				$('#ext_smiles').slideUp();
			}
		);
		
		var html = '';
		
		html += '<div class="ext_smiles_block left">';
			html += '<h3>Vidám</h3>';
			html += '<img src="/kep/faces/vigyor4.gif" alt=""> ';
			html += '<img src="/kep/faces/pias.gif" alt=""> ';
			html += '<img src="/kep/faces/nevetes1.gif" alt=""> ';
			html += '<img src="/kep/faces/eplus2.gif" alt=""> ';
			html += '<img src="/kep/faces/finom.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor2.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor5.gif" alt=""> ';
			html += '<img src="/kep/faces/bohoc.gif" alt=""> ';
			html += '<img src="/kep/faces/bee1.gif" alt=""> ';
			html += '<img src="/kep/faces/nyes.gif" alt=""> ';
			html += '<img src="/kep/faces/lookaround.gif" alt=""> ';
			html += '<img src="/kep/faces/buck.gif" alt=""> ';
			html += '<img src="/kep/faces/crazya.gif" alt=""> ';
			html += '<img src="/kep/faces/hawaii.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor.gif" alt=""> ';
			html += '<img src="/kep/faces/hehe.gif" alt=""> ';
			html += '<img src="/kep/faces/smile.gif" alt=""> ';
			html += '<img src="/kep/faces/nevetes2.gif" alt=""> ';
			html += '<img src="/kep/faces/email.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor0.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor3.gif" alt=""> ';
		html += '</div>';
		
		html += '<div class="ext_smiles_block right">';
			html += '<h3>Szomorú</h3>';
			html += '<img src="/kep/faces/szomoru2.gif" alt=""> ';
			html += '<img src="/kep/faces/shakehead.gif" alt=""> ';
			html += '<img src="/kep/faces/duma.gif" alt=""> ';
			html += '<img src="/kep/faces/rinya.gif" alt=""> ';
			html += '<img src="/kep/faces/sniffles.gif" alt=""> ';
			html += '<img src="/kep/faces/szomoru1.gif" alt=""> ';
			html += '<img src="/kep/faces/sir.gif" alt=""> ';
		html += '</div>';
		
		html += '<div class="ext_smiles_block left">';
			html += '<h3>Egyetért</h3>';
			html += '<img src="/kep/faces/eljen.gif" alt=""> ';
			html += '<img src="/kep/faces/kacsint.gif" alt=""> ';
			html += '<img src="/kep/faces/taps.gif" alt=""> ';
			html += '<img src="/kep/faces/papakacsint.gif" alt=""> ';
			html += '<img src="/kep/faces/wave.gif" alt=""> ';
			html += '<img src="/kep/faces/worship.gif" alt=""> ';
			html += '<img src="/kep/faces/wink.gif" alt=""> ';
			html += '<img src="/kep/faces/awink.gif" alt=""> ';

		html += '</div>';

		html += '<div class="ext_smiles_block right">';
			html += '<h3>Ellenez</h3>';
			html += '<img src="/kep/faces/levele.gif" alt=""> ';
			html += '<img src="/kep/faces/gonosz3.gif" alt=""> ';
			html += '<img src="/kep/faces/action.gif" alt=""> ';
			html += '<img src="/kep/faces/falbav.gif" alt=""> ';
			html += '<img src="/kep/faces/ejnye1.gif" alt=""> ';
			html += '<img src="/kep/faces/unalmas.gif" alt=""> ';
			html += '<img src="/kep/faces/schmoll2.gif" alt=""> ';
			html += '<img src="/kep/faces/nezze.gif" alt=""> ';
			html += '<img src="/kep/faces/kuss.gif" alt=""> ';
	


		html += '</div>';

		html += '<div class="ext_smiles_block left">';
			html += '<h3>Szeretet</h3>';
			html += '<img src="/kep/faces/hamm.gif" alt=""> ';
			html += '<img src="/kep/faces/puszi.gif" alt=""> ';
			html += '<img src="/kep/faces/puszis.gif" alt=""> ';
			html += '<img src="/kep/faces/law.gif" alt=""> ';
			html += '<img src="/kep/faces/szeret.gif" alt=""> ';
			html += '<img src="/kep/faces/love11.gif" alt=""> ';
			html += '<img src="/kep/faces/love12.gif" alt=""> ';
		html += '</div>';

		html += '<div class="ext_smiles_block right">';
			html += '<h3>Utálat</h3>';
			html += '<img src="/kep/faces/mf1.gif" alt=""> ';
			html += '<img src="/kep/faces/kocsog.gif" alt=""> ';
			html += '<img src="/kep/faces/duhos2.gif" alt=""> ';
			html += '<img src="/kep/faces/lama.gif" alt=""> ';
			html += '<img src="/kep/faces/banplz.gif" alt=""> ';
			html += '<img src="/kep/faces/violent.gif" alt=""> ';
			html += '<img src="/kep/faces/gunyos1.gif" alt=""> ';
			html += '<img src="/kep/faces/boxer.gif" alt=""> ';
			html += '<img src="/kep/faces/mf2.gif" alt=""> ';
			html += '<img src="/kep/faces/gun.gif" alt=""> ';
		html += '</div>';

		html += '<div class="ext_smiles_block left">';
			html += '<h3>Csodálkozik</h3>';
			html += '<img src="/kep/faces/csodalk.gif" alt=""> ';
			html += '<img src="/kep/faces/wow1.gif" alt=""> ';
			html += '<img src="/kep/faces/conf.gif" alt=""> ';
			html += '<img src="/kep/faces/rolleyes.gif" alt=""> ';
			html += '<img src="/kep/faces/whatever.gif" alt=""> ';
			html += '<img src="/kep/faces/zavart1.gif" alt=""> ';
			html += '<img src="/kep/faces/confused.gif" alt=""> ';
			html += '<img src="/kep/faces/zavart2.gif" alt=""> ';
			html += '<img src="/kep/faces/fejvakaras.gif" alt=""> ';
			html += '<img src="/kep/faces/pardon1.gif" alt=""> ';
			html += '<img src="/kep/faces/circling.gif" alt=""> ';
			html += '<img src="/kep/faces/ijedt.gif" alt=""> ';
			html += '<img src="/kep/faces/wow3.gif" alt=""> ';
			html += '<img src="/kep/faces/nemtudom.gif" alt=""> ';
			html += '<img src="/kep/faces/merges2.gif" alt=""> ';
			html += '<img src="/kep/faces/wow2.gif" alt=""> ';
			html += '<img src="/kep/faces/guluszem1.gif" alt=""> ';

		html += '</div>';

		html += '<div class="ext_smiles_block right">';
			html += '<h3>Egyéb</h3>';
			html += '<img src="/kep/faces/felkialtas.gif" alt=""> ';
			html += '<img src="/kep/faces/alien2.gif" alt=""> ';
			html += '<img src="/kep/faces/dumcsi.gif" alt=""> ';
			html += '<img src="/kep/faces/idiota.gif" alt=""> ';
			html += '<img src="/kep/faces/help.gif" alt=""> ';
			html += '<img src="/kep/faces/alien.gif" alt=""> ';
			html += '<img src="/kep/faces/bdead.gif" alt=""> ';
			html += '<img src="/kep/faces/ticking.gif" alt=""> ';
			html += '<img src="/kep/faces/ravasz1.gif" alt=""> ';
			html += '<img src="/kep/faces/beka2.gif" alt=""> ';
			html += '<img src="/kep/faces/beka3.gif" alt=""> ';
			html += '<img src="/kep/faces/nezze.gif" alt=""> ';
			html += '<img src="/kep/faces/vigyor1.gif" alt=""> ';
			html += '<img src="/kep/faces/phone.gif" alt=""> ';
			html += '<img src="/kep/faces/heureka.gif" alt=""> ';
			html += '<img src="/kep/faces/gonosz2.gif" alt=""> ';
			html += '<img src="/kep/faces/vomit.gif" alt=""> ';
			html += '<img src="/kep/faces/fogmosas.gif" alt=""> ';
			html += '<img src="/kep/faces/gonosz1.gif" alt=""> ';
			html += '<img src="/kep/faces/oooo.gif" alt=""> ';
			html += '<img src="/kep/faces/integet2.gif" alt=""> ';
			html += '<img src="/kep/faces/wilting.gif" border="0"> ';


		html += '</div>';

		html += '<div style="clear:both;"></div>';
		
		$(html).appendTo('#ext_smiles');


		// Add click event to the smiles
		$('#ext_smiles img').click(function(e) {

			e.preventDefault();
				
			var tag = $(this).attr('src').replace(/.*ep\/faces\/(.*?)\..*/ig, "$1");
	
			var bhtml = '[#' + tag + ']';
			var ihtml = '<img src="/kep/faces/' + tag + '.gif">';

			var tarea = $('textarea[name="message"]:first').val() + bhtml;
			var imod = $(".cleditorMain:first iframe").contents().find('body').html() + ihtml;

			$('textarea[name="message"]:first').val(tarea);
			$('textarea[name="message"]:first').cleditor()[0].focus();
			$('.cleditorMain:first iframe').contents().find('body').html(imod);
			$('textarea[name="message"]:first').cleditor()[0].focus();
		});

	}

};



var message_center = {
	
	init : function() {
		
		// HTML code to insert
		var html = '';
		
			html += '<tr>';
				html += '<td colspan="4">';
					html += '<div>';
						html += '<div class="b-h-o-head ext_mc_tabs">';
							html += '<img src="images/ful_o_l.png" width="1" height="21" vspace="0" hspace="0" align="left">';
							html += '<span class="hasab-head-o">Fórumkategóriák</span>';
						html += '</div>';

						html += '<div class="b-h-b-head ext_mc_tabs">';
							html += '<img src="images/ful_b_l.png" width="1" height="21" vspace="0" hspace="0" align="left">';
							html += '<span class="hasab-head-b">Saját üzeneteim</span>';
						html += '</div>';
						
						html += '<div class="b-h-b-head ext_mc_tabs">';
							html += '<img src="images/ful_b_l.png" width="1" height="21" vspace="0" hspace="0" align="left">';
							html += '<span class="hasab-head-b">Válaszok</span>';
						html += '</div>';
					html += '</div>';
				html += '</td>';
			html += '</tr>';
		
		// Insert tabs
		$('.cikk-2').closest('tr').before(html);
		
		// Create DIV for each pages
		$('.cikk-2').addClass('ext_mc_pages');
		$('.cikk-2').after('<div class="ext_mc_pages"><h3>Még nem érkezett válasz egyetlen kommentedre sem.</h3><div class="contents"></div></div>');
		$('.cikk-2').after('<div class="ext_mc_pages"><h3>Még nincs egy elmentett üzenet sem.</h3></div>');
		
		// Fix right sidebar top position
		$('.cikk-2').closest('tr').children('td:eq(2)').css({ position : 'relative', top : -21 });
		
		// Show the last used tab
		message_center.tab(mxstorage.getItem('mc_selected_tab'));
		
		// Set tab selection events
		$('.ext_mc_tabs').click(function() {
			message_center.tab( $(this).index() );
		});

		// buildOwnCommentsTab
		message_center.buildOwnCommentsTab();

		// Set auto list building in 6 mins
		setInterval(function() {
			message_center.buildOwnCommentsTab();
		}, 360000);
		
		// buildAnswersTab
		message_center.buildAnswersTab();

		// Set auto list building in 6 mins
		setInterval(function() {
			message_center.buildAnswersTab();
		}, 360000);	

		// Start searching ..
		message_center.search();
		
		// Set auto-search in 5 mins
		setInterval(function() {
			message_center.search();
		}, 300000);

	}, 
	
	topic : function() {
		
		// Set-up post logger
		message_center.log();
		
		// Start searching ..
		message_center.search();
		
		// Set auto-search in 5 mins
		setInterval(function() {
			message_center.search();
		}, 300000);
		
		message_center.jump();
	},

	article : function() {
		
		// Set-up post logger
		message_center.log();
		
		// Start searching ..
		message_center.search();
		
		// Set auto-search in 5 mins
		setInterval(function() {
			message_center.search();
		}, 300000);
		
		message_center.jump();	
	},

	tab : function(n) {
		
		// Hide all pages
		$('.ext_mc_pages').hide();
		
		// Show selected page
		$('.ext_mc_pages').eq(n).show();
		
		// Maintain styles, remove active style 
		$('.ext_mc_tabs').removeClass('b-h-o-head').addClass('b-h-b-head');
		$('.ext_mc_tabs').find('img[src*="ful_o_l.png"]').attr('src', 'images/ful_b_l.png');
		$('.ext_mc_tabs').find('.hasab-head-o').removeClass('hasab-head-o').addClass('hasab-head-b');
		
		// Maintain styles, add active style 
		$('.ext_mc_tabs').eq(n).removeClass('b-h-b-head').addClass('b-h-o-head');
		$('.ext_mc_tabs').eq(n).find('img[src*="ful_b_l.png"]').attr('src', 'images/ful_o_l.png');
		$('.ext_mc_tabs').eq(n).find('.hasab-head-b').removeClass('hasab-head-b').addClass('hasab-head-o');
		
		// Store last selected tag for initial status
		rt.post("setMCSelectedTab", { name : "setMCSelectedTab", message : n });
	},
	
	jump : function() {
		
		// Check for message ID in the url
		// Do nothing if not find any comment id
		if(!document.location.href.match('#komment')) {
			return false;
		}
		
		// Fetch comment ID
		var url = document.location.href.split('#komment=');
		var id = url[1];

		// Reset hash
		window.location.hash = '';

		// Find the comment in DOM
		var target = $('.topichead a:contains("#'+id+'")').closest('center');

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);
		
		// Scroll to target element
		$('body').delay(1000).animate({ scrollTop : targetOffset}, 500, function() {
			$(target).css({ border: '2px solid red', margin : '10px 0px', 'padding-bottom' : 10 });
		});
	},
	
	log : function() {
		
		// Check the latest comment for getting the comment ID
		if(getCookie('updateComment')) {

			// Get messages for MC
			var messages = JSON.parse(mxstorage.getItem('mc_messages'));
			
			// Get the comment ID
			var id = getCookie('updateComment');
			
			// Get message contents
			var message = $('.topichead a:contains("#'+id+'")').closest('center').find('.maskwindow').html();

			// Filter out html-s
			$.each([
				[/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
			], function(index, item) {
				message = message.replace(item[0], item[1]);
			});	
			
			for(c = 0; c < messages.length; c++) {
				if(messages[c]['comment_id'] == id) {
				
					// Update message content
					messages[c]['message'] = message;
				}
			}

			// Store new messages object in LocalStorage
			rt.post("setMCMessages", { name : "setMCMessages", message : JSON.stringify(messages) });
			
			// Store in dataStore var
			mxstorage.getItem('mc_messages') = JSON.stringify(messages);
			
			// Remove marker for getting an ID
			removeCookie('updateComment');
		}

		// Check for update marker
		if(getCookie('getCommentID') == '1') {

			// Get messages for MC
			var messages = JSON.parse(mxstorage.getItem('mc_messages'));
			

			// Get the comment ID
			var id = $('.topichead:first a:last').html().match(/\d+/g);
			
			// Get message contents
			var message = $('.topichead:first').next().find('.maskwindow').html();
			
			// Filter out html-s
			$.each([
				[/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
			], function(index, item) {
				message = message.replace(item[0], item[1]);
			});	
			
			// Store the ID for the latest message
			messages[0]['comment_id'] = id[0];

			// Update message content
			messages[0]['message'] = message;

			// Store new messages object in LocalStorage
			rt.post("setMCMessages", { name : "setMCMessages", message : JSON.stringify(messages) });
			
			// Store in dataStore var
			mxstorage.setItem('mc_messages', JSON.stringify(messages));
			
			// Remove marker for getting an ID
			removeCookie('getCommentID');
		}
	
		// Catch comment event
		if(!document.location.href.match('szerkcode')) {
		
			$('form[name="newmessage"]').submit(function() {

				// Article
				if(document.location.href.match('cikkek')) {

					// Get topic name
					var topic_name = $('.cikk-title:first').html();
			
					// Get topic ID
					var topic_id	= $('.std2:last a').attr('href');
						topic_id	= topic_id.split('?id=')[1];
				
				// Topic
				} else {
				
					// Get topic name
					var topic_name = $('select[name="id"] option:selected').text();
			
					// Get topic ID
					var topic_id	= $('select[name="id"] option:selected').val();
				}
			
				// Get comment time
				var time = Math.round(new Date().getTime() / 1000);
			
				// Get message
				var message = $(this).find('textarea').val();
			
				// Build the message object
				var tmp = {
			
					topic_name : topic_name,
					topic_id : topic_id,
					time : time,
					message : message,
					checked : time,
					answers : new Array()
				};
			
			
				// If theres no previous messages
				if(mxstorage.getItem('mc_messages') == '') {
					var messages = new Array();
						messages.push(tmp);
			
				// There is other messages
				} else {
			
					// Get the previous messages from localStorage
					var messages = JSON.parse(mxstorage.getItem('mc_messages'));
				
					// Unshift the new message
					messages.unshift(tmp);
				
					// Check for max entries
					if(messages.length > 10) {
						messages.splice(9);
					}
				}
			
				// Store in localStorage
				rt.post("setMCMessages", { name : "setMCMessages", message : JSON.stringify(messages) });
			
				// Set a marker for gettni the comment ID
				setCookie('getCommentID', '1', 1);	
			});
		} else {
			
			$('form[name="newmessage"]').submit(function() {
			
				// Get comment ID
				var comment_id = parseInt($('.std1:first').find('b').html().match(/\d+/g));
				
				// Set marker to be update this comment
				setCookie('updateComment', comment_id, 1);	
			});
		
		}
	},
	
	search : function() {
		
		// Check if theres any previous posts
		if(mxstorage.getItem('mc_messages') == '')  {
			return false;
		}
		
		// Get the latest post
		var messages = JSON.parse(mxstorage.getItem('mc_messages'));

		// Var to count new messages
		var newmessages = 0;

		// Iterate over the posts
		for(key = 0; key < messages.length; key++) {
			
			// Get current timestamp
			var time = Math.round(new Date().getTime() / 1000);
			
			// Check last searched state
			if(time < messages[key].checked + 60 * 10) {
				continue;
			}

			function doAjax(messages, key) {

				// Var to count new messages
				var counter = 0;

				$.ajax({
				
					url : 'utolso80.php?id=' + messages[key]['topic_id'],
					mimeType : 'text/html;charset=iso-8859-2',
					async: false,
					
					success : function(data) {

						// Parse html response
						var tmp = '';
							 tmp = $(data);
							 
						var answers = new Array();
						var TmpAnswers = new Array();
						
							// Search posts that is an answer to us
							 TmpAnswers = $( tmp.find('.msg-replyto a:contains("#'+messages[key]['comment_id']+'")').closest('center').get().reverse() );

						// Iterate over the answers
						if(TmpAnswers.length == 0) {

							// Get current time
							var time = Math.round(new Date().getTime() / 1000);
					
							// Set new checked date
							messages[key]['checked'] = time;						

							// Store in localStorage
							rt.post("setMCMessages", { name : "setMCMessages", message : JSON.stringify(messages) });
						
							// Store in dataStore
							mxstorage.setItem('mc_messages', JSON.stringify(messages));

							return false;

						}

						for(c = 0; c < TmpAnswers.length; c++) {
							
							var nick = ($(TmpAnswers[c]).find(".topichead table tr:eq(0) td:eq(0) a img").length == 1) ? $(TmpAnswers[c]).find(".topichead table tr:eq(0) td:eq(0) a img").attr("alt") : $(TmpAnswers[c]).find(".topichead table tr:eq(0) td:eq(0) a")[0].innerHTML;
								nick = nick.replace(/ - VIP/, "");
							
							var message = $(TmpAnswers[c]).find('.maskwindow').html();

							var id = $(TmpAnswers[c]).find('.topichead a:last').html().match(/\d+/g)[0];
							
							var AD = {
								id : id,
								author : nick,
								message : message
							};
							
							answers.push( AD );
						}

						// Count new messages
						if( messages[key]['answers'].length != TmpAnswers.length ) {
							counter = 1;
						}

						// Get current time
						var time = Math.round(new Date().getTime() / 1000);
					
						// Set new checked date
						messages[key]['checked'] = time;
						
						// Set the answers
						messages[key]['answers'] = answers;
					
						// Store in localStorage
						rt.post("setMCMessages", { name : "setMCMessages", message : JSON.stringify(messages) });
						
						// Store in dataStore
						mxstorage.setItem('mc_messages', JSON.stringify(messages));
					}
				});
				
				return counter;
			}
			
			// Make the requests
			newmessages += doAjax(messages, key);
		}

		// Sync new messages if any
		if(newmessages > 0 && mxstorage.getItem('sync_auth_key') != '') {
			sync_cp.save('Message Center');
		}
	},
	
	buildOwnCommentsTab : function() {

		// Check if theres any previous posts
		if(mxstorage.getItem('mc_messages') == '')  {
			return false;
		}

		// Get the previous messages form LocalStorage
		var messages = JSON.parse(mxstorage.getItem('mc_messages'));
		
		if(messages.length > 0) {
			$('.ext_mc_pages:eq(1)').html('');
		}
		
		// Iterate over the messages
		for(c = 0; c < messages.length; c++) {
			
			// Get the post date and time
			var time = date('Y. m. d. -  H:i', messages[c]['time']);
			
			// Get the today's date
			var today =  date('Y. m. d.', Math.round(new Date().getTime() / 1000));
			
			// Get yesteday's date
			var yesterday = Math.round(new Date().getTime() / 1000) - 60 * 60 * 24;
				yesterday = date('Y. m. d.', yesterday);
				
			// Convert today and yesterday strings
			$.each([
				[today, "ma"],
				[yesterday, "tegnap"]

			], function(index, item) {
				time = time.replace(item[0], item[1]);
			});	
			
			// Get the message
			var msg = messages[c]['message'];
			
			// Filter out BB tags and add line breaks
			$.each([
				[/[\r|\n]/g, "<br>"],
				[/\[.*?\]([\s\S]*?)\[\/.*?\]/g, "$1"]

			], function(index, item) {
				msg = msg.replace(item[0], item[1]);
			});			
			
			var html = '';
			
				html += '<div class="ext_mc_messages">';
					html += '<p><a href="http://www.sg.hu/listazas.php3?id='+messages[c]['topic_id']+'">'+messages[c]['topic_name']+'</a></p>';
					html += '<span>'+time+'</span>';
					html += '<div>'+msg+'</div>';
				html += '</div>';
			
			$(html).appendTo('.ext_mc_pages:eq(1)');
		}	
	},
	
	buildAnswersTab : function() {

		// Check if theres any previous posts
		if(mxstorage.getItem('mc_messages') == '')  {
			return false;
		}
	
		// Get the previous messages form LocalStorage
		var messages = JSON.parse(mxstorage.getItem('mc_messages'));

		// Empty the container first for re-init
		$('.ext_mc_pages:eq(2) div.contents').html('');


		// Iterate over the messages
		for(c = 0; c < messages.length; c++) {
			
			// Html to insert
			var html = '';
			
			// Continue when no answers
			if(messages[c]['answers'].length == 0) {
				continue;
			}

			// Get the post date and time
			var time = date('Y. m. d. -  H:i', messages[c]['time']);
			
			// Get the today's date
			var today =  date('Y. m. d.', Math.round(new Date().getTime() / 1000));
			
			// Get yesteday's date
			var yesterday = Math.round(new Date().getTime() / 1000) - 60 * 60 * 24;
				yesterday = date('Y. m. d.', yesterday);
				
			// Convert today and yesterday strings
			$.each([
				[today, "ma"],
				[yesterday, "tegnap"]

			], function(index, item) {
				time = time.replace(item[0], item[1]);
			});	
			
			// Get the message
			var msg = messages[c]['message'];
			
			// Filter out BB tags and add line breaks
			$.each([
				[/[\r|\n]/g, "<br>"],
				[/\[.*?\]([\s\S]*?)\[\/.*?\]/g, "$1"]

			], function(index, item) {
				msg = msg.replace(item[0], item[1]);
			});	

			// Own comment
			html += '<div class="ext_mc_messages">';
				html += '<p><a href="http://www.sg.hu/listazas.php3?id='+messages[c]['topic_id']+'">'+messages[c]['topic_name']+'</a></p>';
					html += '<span>'+time+'</span>';
					html += '<div>'+msg+'</div>';
			html += '</div>';
			
			// Iterate over the answers
			for(a = 0; a < messages[c]['answers'].length; a++) {
			
				html += '<div class="ext_mc_messages ident">';
					html += '<p>';
						html += ''+messages[c]['answers'][a]['author']+'';
						html += ' - <a href="http://www.sg.hu/listazas.php3?id='+messages[c]['topic_id']+'#komment='+messages[c]['answers'][a]['id']+'" class="ext_mc_jump_to">ugrás a hozzászólásra</a>';
					html +='</p>';
					html += '<div>'+messages[c]['answers'][a]['message']+'</div>';
				html += '</div>';
			}
			
			// Insert html
			$(html).appendTo('.ext_mc_pages:eq(2) div.contents');
			
			if(html != '') {
				$('.ext_mc_pages:eq(2)').find('h3').remove();
			}
		}	
	}

};


function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++) {
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name) {
			return unescape(y);
		}
	}
}

function removeCookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + "=" +
	( ( path ) ? ";path=" + path : "") +
	( ( domain ) ? ";domain=" + domain : "" ) +
	";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}



var topic_whitelist = {

	execute : function(ele) {
		
		// Get topic ID
		var id = $('select[name="id"] option:selected').val();
		
		// Add topic to whitelist
		if($(ele).html() == '+') {
			
			// Change the status icon
			$(ele).html('-');
			
			// Change status title
			$(ele).attr('title', 'Téma eltávolítása a fehérlistából');

			// Add to config
			rt.post("addTopicToWhitelist", { name : "addTopicToWhitelist", message : id });
			
		// Remove topic from whitelist
		} else {

			// Change the status icon
			$(ele).html('+');

			// Change status title
			$(ele).attr('title', 'Téma hozzáadása a fehérlistához');

			// Remove from config
			rt.post("removeTopicFromWhitelist", { name : "removeTopicFromWhitelist", message : id });
		}
	},
};


var textarea_auto_resize = {
	
	height : 150,
	
	init : function() {
		
		// Create the text holder element
		$('<div id="ext_textheight"></div>').prependTo('body');
		
		// Create the keyup event
		$('form[name="newmessage"] textarea').on('keyup', function() {
			textarea_auto_resize.setHeight(this);
		});
		
		textarea_auto_resize.height = $('form[name="newmessage"] textarea').height();
	},
	
	setHeight : function(ele) {
		
		// Get element value
		var val = $(ele).val();
		
		// Escape the value
		val = val.replace(/</gi, '&lt;');
		val = val.replace(/>/gi, '&gt');
		//val = val.replace(/\ /gi, '&nbsp;');
		val = val.replace(/\n/gi, '<br>');
		
		// Set the textholder element width
		$('#ext_textheight').css('width', $(ele).width());
		
		// Set the text holder element's HTML
		$('#ext_textheight').html(val);
		
		// Get the text holder element's height
		var height = $('#ext_textheight').height() + 14;
		
		// Check for expand
		if(height > $(ele).height()) {
			$(ele).height( $(ele).height() + 50);
		}
		
		// Check for shrink
		if( $(ele).height() > textarea_auto_resize.height && height < $(ele).height() ) {
		
			var newHeight = height < textarea_auto_resize.height ? textarea_auto_resize.height : height;
			
			$(ele).height( newHeight );
		}
		
	}
};

var disable_point_system = {

	activated : function() {
		
		$('#forum-posts-list ul li .forum-post-rate').hide();
		$('#forum-posts-list ul li .forum-post-rate-place span').hide();
/*		$('.msg-text').each(function() {
			if( $(this).next().attr('id') == 'leful') {
				$(this).next().hide();
			}
		});*/
	}
};

var profiles = {

	init : function() {

		// Get the profiles object
		var profiles = JSON.parse(mxstorage.getItem('profiles'));
		
		// Maxthon fix + Check empty
		if(profiles != null && !profiles.length) {
			return false;
		}
		
		// Iterate over the comments
		$('#forum-posts-list ul li header:not(.checked)').each(function() {

			// Create the wrapper if not any
			if( !$(this).next().is('.wrapper') ) {
			    
			    // Create the wrapper
			    var wrapper = $('<div class="wrapper"></div>').insertAfter( this ).css('position', 'relative');
			    
			    // Place in other elements
			     $(this).parent().find('section.body, footer').appendTo( wrapper );
			}

			// Get nickname
			if(document.location.href.match('cikkek')) {

				var nick = $(this).find('a:first').html();

			} else {

				var nick = ($(this).find("a img").length == 1) ? $(this).find("a img").attr("alt") : $(this).find("a")[0].innerHTML;
					nick = nick.replace(/ - VIP/, "");
			}
			
			// Remove old outlines and titles
			$(this).next().find('.outline').remove();
			$(this).find('.titles').remove();
			
			// Set the background to default and remove paddings
			//$(this).next().find('.msg-text:first').css('background-color', '#F0F0F0');
			$(this).next().find('section.body, footer').css('padding', 3);
			
			//Maxthon fix
			if (profiles != null) {
				// Iterate over the profile settings
				// Search for nickname match
				for(c = 0; c < profiles.length; c++) {
					for(u = 0; u < profiles[c]['users'].length; u++) {
						if( jQuery.trim(profiles[c]['users'][u]) == nick) {
							
							// WE GOT A MATCH

							// Title
							var placeholder = $('<span class="titles">'+profiles[c]['title']+'</span>').appendTo( $(this).find('td.left:eq(1)') );
								placeholder.css('padding-left', 10);
							
							// Calc outline width 
							var width = (1 + $(this).parent().find('.wrapper:first .outline').length) * 8 - 8;
							
							// Border
							var outline = $('<div class="outline"></div>').insertBefore( $(this).parent().find('.msg-text:first') );
								outline.css({ width : 6, height : '100%', position : 'absolute', left : width, top : 0, backgroundColor : '#'+profiles[c]['color'][0] });
							
							// Background
							if(profiles[c]['background']) {
								$(this).parent().find('section.body, footer').css('background-color', '#'+profiles[c]['color'][1]);
						}
							
							// Fix msg-text
							$(this).parent().find('section.body, footer').css('padding-left', (width+3+8));	
						}
					}
				}
			};

			// Add checked marker
			$(this).addClass('checked');
		});
	}
};


var add_to_list = {
	
	colors : {
	
		'1' : '7fadd4', '2' : '90abc3', '3' : '597995', '4' : '657889', '5' : '658969',
		'6' : '898665', '7' : '897665', '8' : '896586', '9' : '986856', '10' : '985690',
		'11' : '565698', '12' : '56988f', '13' : '689856', '14' : '979155', '15' : '977455', 
		'18' : '9dc6e2', '19' : '9ca7e2', '20' : 'c99ce2', '21' : 'e29cdb', '22' : 'e29da5',
		'24' :  'c0c0c0', '25' : 'a0a0a0', '26' : '808080', '27' : '555555'
	},
	
	init : function() {
		
		
		// Create dropdowns
		$('#forum-posts-list ul li header:not(.ext_add_to_list_topichead) a:contains("#")').each(function() {

			// Insert separator
			var separator = $('<span class="separator pull-right"></span>').insertBefore(this);

			// Insert dropdow placeholder
			var dropdown = $('<div class="ext_dropdown pull-right"><span>&#9660;</span></div>').insertBefore(separator);
			
			// Insert dropdown list
			var list = $('<ul></ul>').appendTo(dropdown).addClass('ext_addtolist_list');
			
			// Set dropdown background color
			var color_id = $(this).closest('#forum-posts-list ul li').css('background-image').match(/\d+/g);

				if(color_id) {
					list.css('background-color', '#' + add_to_list.colors[color_id]);
				} else {
					list.css('background-color', '#ccc');
				}
			
			// Set relative position to the container
			$(this).closest('#forum-posts-list ul li header').css('position', 'relative').addClass('ext_add_to_list_topichead');
		});

		// Create dropdown event
		$('.ext_dropdown').off().on('click', function() {
			
			if( $(this).find('ul').css('display') == 'none') {
				$(this).find('ul').css('top', $(this).closest('.topichead').height() ).slideDown();
			} else {
				$(this).find('ul').slideUp();
			}
		});
		
		$('.ext_addtolist_list').find('*').remove();
		
		// Build list
		add_to_list.buildList();

		// Create events for blocklist
		$('.ext_addtoblocklist').off().on('click', function() {
			blocklist.block(this);
		});
		
		// Create events for lists
		$('.ext_addtolist').off().on('click', function() {
			add_to_list.addToList( $(this).attr('class').match(/\d+/g), this );
		});
	},
	
	
	buildList : function() {
	
		// Add the title
		$('<li><h3>Hozzáadás listához</h3></li>').appendTo('.ext_addtolist_list');

		// Insert separator
		$('<li><hr></li>').appendTo('.ext_addtolist_list');

		// Add blocklist option
		$('<li class="ident ext_addtoblocklist">Tiltólista</li>').appendTo('.ext_addtolist_list');
		
		if(mxstorage.getItem('profiles') == '') {
			return;
		}
		
		// Get the profile groups
		var profiles = JSON.parse(mxstorage.getItem('profiles'));
		
		// Iterate over the groups, add each one to the list
		/* Maxthon fix */
		if (profiles != null) { 
			for(c = 0; c < profiles.length; c++) {
				$('<li><hr></li>').appendTo('.ext_addtolist_list');
				$('<li class="ident ext_addtolist profile_'+c+'" style="color: #'+profiles[c]['color'][0]+';">'+profiles[c]['title']+'</li>').appendTo('.ext_addtolist_list');
			}
		};


	},
	
	
	addToList : function(group, ele) {
		
		// Get profiles
		var list = JSON.parse(mxstorage.getItem('profiles'));
		
		// Get user's nick
		var anchor = $(ele).closest('#forum-posts-list ul li header').find('a[href*="felhasznalo"]');

		if(anchor.children('img').length > 0) {
			var nick = anchor.children('img').attr('title').replace(" - VIP", "");
	
		} else {
			var nick = anchor.html().replace(" - VIP", "");
		}
		
		// Check user
		if(list[group]['users'].indexOf(nick) == -1) {
			list[group]['users'].push(nick);
		} else {
			list[group]['users'].splice( list[group]['users'].indexOf(nick), 1 );
		}
		
		// Stringify the new profiles list
		var data = JSON.stringify(list);
		
		// Save in dataStore
		mxstorage.setItem('profiles', data);
		
		// Save in localStorage
		rt.post("setSetting", { name : "setSetting", key : 'profiles', val : data });
		
		
		// Remove checked class for update
		$("#forum-posts-list ul li").each( function() {
			
			if(document.location.href.match('cikkek')) {
			
				var nick_2 = $(this).find('a:first').html();

			} else {
			
				var nick_2 = ($(this).find("header a img").length == 1) ? $(this).find("header a img").attr("alt") : $(this).find("header a")[0].innerHTML;
					nick_2 = nick_2.replace(/ - VIP/, "");
			}
			
			if(nick == nick_2) {
				$(this).removeClass('checked');
			}
		});
		
		// Update content GUI
		profiles.init();

		// Initiate sync
		sync_cp.save('Profiles Content Script');
	}
};


var columnify_comments = {
	
	activated : function() {

		$('#forum-posts-list ul li header:not(.columnify)').each(function() {
			
			// Get the message element
			var target = $(this).next('.wrapper').find('section.body');
			
			// Add multi column when the text is larder than 200px
			if( target.html().length > 800) {
				target.css({ '-webkit-column-width' : 200, '-webkit-column-gap' : 20, 'text-align' : 'justify' });
			}
			
			// Add 'columnify' class
			$(this).addClass('columnify');
		});
	},
	
	disabled : function() {
		
		$('#forum-posts-list ul li header').each(function() {
			$(this).next().find('section.body').css({ '-webkit-column-width' : 'auto', '-webkit-column-gap' : 0 });
		});
	}
	
};

var quick_user_info = {
	
	activated : function() {

		$('#forum-posts-list ul li').each(function() {

			//Do not add the mouseenter function again if the element already has it
			if(!$(this).data('events')) {

				var spoilerimg = "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";

				$($(this)).mouseenter(function() {
				if ($(this).not('.quick_user_info'))
				{
					//Place info image
				    $(this).addClass('quick_user_info').find('span.icons').after('<span class=""><img src="data:image/png;base64,'+ spoilerimg +'" class="ext_quick_user_info_btn"></span>');
				}
			    $(this).append('<div class=\"infobox\"></div>');

			    //Add EventListener
			    $('img.ext_quick_user_info_btn').click(function(e) {

			    	//Get user profile URL
					var url = $(this).closest('header').find('a[href^="/felhasznalo"]').attr('href'); 

					//Fix for vip, non vip topichead height
					var th_height = $(this).closest('header').css('height').replace('px', '');

					//Get topichead pos from the top of the page
					var fromTop = $(this).closest('header').offset().top - 122;
					
					//If "highlight_comments_for_me" is on we need to change the fromTop to the comment position
					if ($(this).closest('li').has('img.ext_comments_for_me_indicator').length ? true : false )
					{
						//Correct according a default padding on the messages
						fromTop = $(this).closest('header').css('padding-top').replace('px', '');
					}
					var fullHeight = parseInt(fromTop,10) + parseInt(th_height,10);

					//Show infobox -121
					$('.infobox').css({ 'font-size' : '10px' , 'display' : 'block', 'top' : fullHeight });

					//Show user information in infobox
				    $('.infobox').load(url + ' table.data-table'); 

				});

				}).mouseleave(function() {

					//Remove info image and infobox on mouseleave
				    $(this).find(".ext_quick_user_info_btn").parent().remove();		    
				    $(this).find(".infobox").remove();
				});
			};
		});
	}
};

var better_yt_embed = {

	activated : function() {

		function doit($)
		{
			if (!$) return;
			$("<style type='text/css'>.yt-icon { width:48px; height:21px; float:left; margin-right:6px; background-repeat:no-repeat; "+
				"background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAgACAAD/2wBDAAYEBQYFBAY"+
				"GBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwo"+
				"IChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAA"+
				"VADADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAQFBgcIAQP/xAAuEAACAQMCBQMCBgMAAAAAAAABAgM"+
				"EBREAEgYTITFRFEFhByIIFRYjcYEzgpH/xAAaAQACAgMAAAAAAAAAAAAAAAAABAIGAQMF/8QAJhEAAQQBAgQHAAA"+
				"AAAAAAAAAAQACAxEhBDEFEkGBIlFSYXGx0f/aAAwDAQACEQMRAD8AzhWcOT0tGKp5ozTtTRVCuoOGLgHYPkfcD8q"+
				"dMxikGco/QZPTsPOp9w1M1ba+EoJQHUXf0YU9mjEkcgB/2mf/ALpVL+/aqpdoarWzypIAuGyK1AoPzt2f1jQhNf0"+
				"vsNtu16mW/SenpYgAztGXCE56lRgntjHzq2+LfpzaLBc2oKGCC5zxMqz8ugKiJnAKDJzktnp/GoBb6hDxbxQ0ZBV"+
				"6rcp8gltaWPNqeOOKEgjMjLc7NKwHsqkEn+BpGUF7yPj6Vm0T2QQRyUDYN4HqA3q9j59FTty4Co6axW+5/lUEkdS"+
				"srSqtJj0+yQp9xx7ke+PGonxdwjS01hmqDa2o35LTQScsoHAGensRrQVVNVfpWucc30At91Vzk8vmGr+3Ptu74/v"+
				"Uf/EDWyNwvcF9M0dE1W7080tRu5i+nA/aTaMR429ieo1ARlviBPRMHVRygxvjbnmzjFbd1koVlUtItKKmYUyyc5Y"+
				"Q52CTAG8L23YAGe/TSiS93WSqkqZLnXPUSRmJ5Wncu6HupOckfGjRroqor2ob/XU9wmrJpXqpp/8AK07lmc+Sx65"+
				"0+Djuq3s7QOXbGWE5ycdvbRo1rdE1xshNRa2eFvKx2Oy63HVQyFDTuVPcGckHrnx566QXbiyruFGabYEjK7erliF"+
				"8Dxo0awIWA3Sm/iGoeC0uwfYfi//Z); }"+
				"span.yt-title { display:inline-block; background:black; color:yellow; padding:5px; "+
				"font-size:14px; font-weight:bold; cursor:pointer; }</style>")
				.appendTo(document.head);

			var req = '<feed xmlns="http://www.w3.org/2005/Atom" '+
				'xmlns:media="http://search.yahoo.com/mrss/" '+
				'xmlns:batch="http://schemas.google.com/gdata/batch" '+
				'xmlns:yt="http://gdata.youtube.com/schemas/2007"> '+
				'<batch:operation type="query" /> '+
				'<entry><id>'+_yt_entries.join('</id></entry><entry><id>')+'</id></entry>'+
				'</feed>';

			$.ajax({type: 'POST', url: 'http://gdata.youtube.com/feeds/api/videos/batch?fields=entry(id,title)', data: req, dataType: 'xml', success: function(data) {
				var titles = {};
				$(data).children().children().each(function() {
					var vals = $(this).children();
					var id = vals.eq(0).text().split('/');
					id = id[id.length - 1];
					titles[id] = vals.eq(1).text();
				});
				$(_yt_objects).each(function() {
					var me = this;
					if (!titles[me.id]) return true;
					$(me.container).hide();
					$("<div><span class='yt-title'><div class='yt-icon'></div>"+titles[me.id]+"</span></div>")
						.insertBefore(me.container).click(function() {
							if (!me.is_attached) { $(me.container).html(me.obj); me.is_attached = true; }
							$(me.container).toggle();
							return false;
						});
				});
			}});
		}

		var entries = [], objects = [], embeds = $('embed'), i, id;

		for (i in embeds) {
			if (embeds[i].parentNode && embeds[i].src.indexOf('youtube') > 0) {
				var id = embeds[i].src;
				id = id.split('/');
				id = id[id.length - 1].split('&')[0];
				entries.push('http://gdata.youtube.com/feeds/api/videos/'+id);
				objects.push({"id": id, "obj": (embeds[i].parentNode.wrappedJSObject ? embeds[i].parentNode.wrappedJSObject : embeds[i].parentNode) });
			}
		}

		if (entries.length > 0) {
			for (i in objects) {
				objects[i].container = document.createElement('div');
				objects[i].obj.parentNode.insertBefore(objects[i].container, objects[i].obj);
				objects[i].obj.parentNode.removeChild(objects[i].obj);
			}

			var uw = window.wrappedJSObject;
			if (window.navigator.vendor.indexOf('Google') >= 0) {
				var e = document.createElement('div');~
				e.setAttribute('onclick', 'return window;');
				uw = e.onclick();
			}

			uw._yt_objects = objects;
			uw._yt_entries = entries;

			var s = document.createElement('script');
			s.setAttribute('type', 'text/javascript');
			s.textContent = '(' + doit + ')(jQuery);'
			document.head.appendChild(s);
		}
	}
}

var quick_insertion = {

	activated : function() {

		var ta;
		var ta2;
		if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			ta = $('.cleditorMain:first iframe').contents().find('body'); //textarea
			ta2 = $('.cleditorMain:first textarea[name="message"]');
		}
		else {
			ta = $('form[name="newmessage"] textarea');
		}

		// Paste event on WYSIWYG view and source view
		$(ta).add(ta2).on('paste', function(e) {
			
			var data = e.originalEvent.clipboardData.getData('Text');
			if (data.length > 10) {
	
				var urlpattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
				var imgpattern = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;

				var bhtml;
				var ihtml;

				if (imgpattern.test(data)) {
					e.preventDefault();
					bhtml = '[img]' + data + '[/img]';
					ihtml = '<img src="' + data + '">';
				} 
				else if (urlpattern.test(data)) {
					e.preventDefault();

					var a = document.createElement('a'); // Create a dummy <a> element
					a.href = data;                       // Assign link, let the browser parse it
					var url_pathname = a.pathname.substring(1, data.length);
					if (url_pathname.length == 0) {
						url_pathname = data;
					}
					bhtml = '[url=' + data + ']' + url_pathname + '[/url]';
					ihtml = '<a href="' + data + '">' + url_pathname +'</a>';
				} 

				if (bhtml != undefined) {
					var tarea = $('textarea[name="message"]:first').val() + bhtml;
					var imod = $(".cleditorMain:first iframe").contents().find('body').html() + ihtml;

					// Otherwise when wysiwyg editor will appear even if it's disabled
					if(mxstorage.getItem('wysiwyg_editor') == 'true') {
						$('textarea[name="message"]:first').val(tarea);
						$('textarea[name="message"]:first').cleditor()[0].focus();
						$('.cleditorMain:first iframe').contents().find('body').html(imod);
						$('textarea[name="message"]:first').cleditor()[0].focus();

					} else {
						$('textarea[name="message"]:first').val(tarea);
					}
				}

			} else {
				return true;
			}
1
		});
	}

}

var spoiler_button = {

	activated : function() {

		var spoilerImg = "iVBORw0KGgoAAAANSUhEUgAAAE0AAAARCAYAAACYRSE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6ElEQVR42u2YvQoCMQyA7+EcVMTR0VX84zZdxEE3F50EJxcXUQQRFwfBQRAXH6kSoVKS1vQw3RL4SJvkcvCNzYwx2XzzMkoc4OsjrNY/KZGU2mvzlVbubBUGlSYhrdLdKQweaXuFgUir9g5JcMN3D83Zmpt9s9xeSYi0en4UB+JXzZ7xHK6H+txeaYi0xuCcBBv4jmv4G1/mduCaNERac3RJCoSbfb3QbKgfqvn6EhBprelVHDfcWtFZ3MOB94b+8S9EWj67KQxE2nBxVxiItPHyoTAQaZPVU2Eg0pQCrxzwPgQHJQ7w9QbHYXOg9wp+xgAAAABJRU5ErkJggg==";
		var makroImg = "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/GMzLdsAADw1aVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAyMSA3OS4xNTQ5MTEsIDIwMTMvMTAvMjktMTE6NDc6MTYgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTQtMDYtMjVUMTE6MzQ6NTgrMDI6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNC0wNi0yNVQxMTozNTowOSswMjowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTQtMDYtMjVUMTE6MzU6MDkrMDI6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCIElFQzYxOTY2LTIuMTwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgICAgICAgIDxwaG90b3Nob3A6VGV4dExheWVycz4KICAgICAgICAgICAgPHJkZjpCYWc+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyTmFtZT4/PC9waG90b3Nob3A6TGF5ZXJOYW1lPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyVGV4dD4/PC9waG90b3Nob3A6TGF5ZXJUZXh0PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QmFnPgogICAgICAgICA8L3Bob3Rvc2hvcDpUZXh0TGF5ZXJzPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjU5YTFkZDdjLTk1MDAtODg0Zi1iYjAzLWFmNjkyMmY1YWZmYjwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDowOTdlZTE2Yi01M2QzLTM0NDItYjhkNS1hYmM2MzBlZjQ0YzA8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDowOTdlZTE2Yi01M2QzLTM0NDItYjhkNS1hYmM2MzBlZjQ0YzA8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MDk3ZWUxNmItNTNkMy0zNDQyLWI4ZDUtYWJjNjMwZWY0NGMwPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE0LTA2LTI1VDExOjM0OjU4KzAyOjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y29udmVydGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpwYXJhbWV0ZXJzPmZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjU5YTFkZDdjLTk1MDAtODg0Zi1iYjAzLWFmNjkyMmY1YWZmYjwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNC0wNi0yNVQxMTozNTowOSswMjowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNzwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xNzwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+zqOLogAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAABHklEQVR42mL8//8/w4SlF/4zkAkKog0YGfuXnP+/9+QTcs1g+PHnzTYWGOfP328kG8DCzMXAwMDAwMRABQB3CSMjE0NBhD6Dm40qXg27jtxmmLDiInZDGBgYoZgQwFSH4pKJKy8zTFx5GatWbytZhqxIEwYGBkYGRkYm7IawMDNjaEz0UWfg5mRlYGBgYBAV4oJaxghX++8fmiEc7CwYhrjbKDFwcrCiiDExM8LVfvv+D80QNlYMQ/adfMTAzYlq+OPnX+Fqv33/iWoIJxaXbD78CGv4INT+RPcOZph05FkxMDAwMFRMOkZcOuFgY8Eem7jksBnCzobpkva5Z3HK4YhiJsqT/akrL8k2hPH///8MrlkLtpJrwO5pCd6AAQC5wkCZVQaFIQAAAABJRU5ErkJggg==";

		if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			
			// Place makro button somewhere else
			$('form[name="newmessage"] a:eq(1)').css({ 'position' : 'absolute', 'left' : 380 , 'width' : '17px'}); // 380

			// Add spoiler button
			$('form[name="newmessage"] a:eq(5)').after('<a id="spoilerButton"><img src="data:image/png;base64,'+spoilerImg+'" width="77" height="17" border="0"></a>');
			$('#spoilerButton').css({  'position' : 'absolute', 'left' : 110 , 'cursor': 'pointer'}); // 380
		}
		else {
			// Make macro image smaller
			$('form[name="newmessage"] a:eq(1) img').attr('src', 'data:image/png;base64,'+ makroImg +'').css({ 'width' : '17px' });
			$('form[name="newmessage"] a:eq(1)').css({ 'left' : 360 }); //'position' : 'absolute'

			// Add spoiler button
			$('form[name="newmessage"] a:eq(5)').after('<a id="spoilerButton"><img src="data:image/png;base64,'+ spoilerImg +'" width="77" height="17" border="0"></a>');
			$('#spoilerButton').css({  'margin-left' : 5, 'cursor': 'pointer'}); // 'position' : 'absolute', 'left' : 360
		}

		// Add click event to the spoiler button
		$('#spoilerButton img').click(function(e) {

			e.preventDefault();
					
			var bhtml = '[spoiler] [/spoiler]';

			var tarea = $('textarea[name="message"]:first').val() + bhtml;
			
			// Otherwise cleditor will apear even if it's turned off
			if(mxstorage.getItem('wysiwyg_editor') == 'true') {
				var ihtml = '<img src="'+rt.getPrivateUrl("/img/content/warning.png")+'"> ';
				var ihtml2= '<img src="'+rt.getPrivateUrl("/img/content/warning2.png")+'">';

				var imod = $(".cleditorMain:first iframe").contents().find('body').html() + ihtml + ' ' +ihtml2;

				$('textarea[name="message"]:first').cleditor()[0].focus();
				$('.cleditorMain:first iframe').contents().find('body').html(imod);
				$('textarea[name="message"]:first').cleditor()[0].focus();
			}
			$('textarea[name="message"]:first').val(tarea);

		});
	}
}

var tempScript = {

	activated : function() {
		$(".msg-text").each(function(){
        	var msg=$(this).html();
        	$(this).html(msg.replace(/(&amp;|&)<a href="JavaScript.+?(#\d+)<\/a>.+?;/g,'&$2;'));
    	});
	}
}

var update_settings = {

	activated : function()
	{
		var msg = $("input[name='msglimit']").val();
		port.postMessage({ name : "setSetting", key : 'msg_per_page', val : msg });

		/*dataStore['msg_per_page'] = $("input[name='msglimit']").val();*/
	}
}

function extInit() {

	if (document.location.href == 'https://sg.hu/felhasznalo/beallitasok')
	{
		update_settings.activated();
	}

	// SG index.php
	if(document.location.href == 'http://www.sg.hu/' || document.location.href.match('index.php')) {
	
		// Settings
		cp.init(3);


	// Articles
	} else if(document.location.href.match('cikkek')) {
	
		// Settings
		cp.init(2);

		// Maxthon css inject fix
		injectCss.init(2);
		
		// setPredefinedVars
		setPredefinedVars();

		// Maintain style settings
		$('.b-h-o-head a').closest('.b-h-o-head').attr('class', 'b-h-o-head topichead');
		$('.b-h-o-head').css('background', 'url(images/ful_o_bgbg.gif)');
		$('.b-h-o-head .msg-dateicon a').css('color', '#444');

		// Message Center
		if(mxstorage.getItem('message_center') == 'true' && isLoggedIn() ) {
			message_center.article();
		}

		// Threaded_comments
		if(mxstorage.getItem('threaded_comments') == 'true') {
			threaded_comments.activated();
		}
		
		// Set-up block buttons
		add_to_list.init();

		// Block users/messages
		if(mxstorage.getItem('block_list') != '') {
			blocklist.hidemessages();
		}

		// Load next page when scrolling down
		if(mxstorage.getItem('autoload_next_page') == 'true') {
			autoload_next_page.activated();
		}

		// Show navigation buttons
		if(mxstorage.getItem('show_navigation_buttons') == 'true') {
			show_navigation_buttons.activated();
		}
	
		// Animated replyto
		replyTo();

		// Overlay reply-to
		if(mxstorage.getItem('overlay_reply_to') == 'true') {
			overlay_reply_to.activated();
		}
	
		// highlight_comments_for_me
		if(mxstorage.getItem('highlight_comments_for_me') == 'true' && isLoggedIn()) {
			highlight_comments_for_me.activated();
		}

		// show menitoned comment
		if(mxstorage.getItem('show_mentioned_comments') == 'true') {
			show_mentioned_comments.activated();
		}

		// WYSIWYG Editor
		if(mxstorage.getItem('wysiwyg_editor') == 'true') {
			wysiwyg_editor.activated();
		}

		if(mxstorage.getItem('disable_point_system') == 'true') {
			disable_point_system.activated();
		}

		// Auto resizing textarea
		textarea_auto_resize.init();

		if(mxstorage.getItem('profiles') != '') {
			profiles.init();
		}

		if(mxstorage.getItem('columnify_comments') == 'true') {
			columnify_comments.activated();
		}

		//Pasted text will be a hyperlink, picture, video automatically
		if(mxstorage.getItem('wysiwyg_editor') == 'true' && mxstorage.getItem('quick_insertion') == 'true') {
			quick_insertion.activated();
		}

		// Dedicated spoiler button
		if(mxstorage.getItem('spoiler_button') == 'true') {
			spoiler_button.activated();
		}

	// FORUM.PHP
	} else if(document.location.href.match('forum\/$')) {

		// Settings
		cp.init(1);

		// Maxthon css inject fix
		injectCss.init(1);

		// setPredefinedVars
		setPredefinedVars();

		// Remove chat window
		if(mxstorage.getItem('chat_hide') == 'true') {
			chat_hide.activated();
		}

		// Custom blocks
		if(mxstorage.getItem('custom_blocks') == 'true') {
			custom_blocks.activated();
		}
		
		// Jump the last unreaded message
		if(mxstorage.getItem('jump_unreaded_messages') == 'true' && isLoggedIn() ) {
			jump_unreaded_messages.activated();
		}
		
		// Faves: show only with unreaded messages
		if(mxstorage.getItem('fav_show_only_unreaded') == 'true' && isLoggedIn() ) {
			fav_show_only_unreaded.init();
			fav_show_only_unreaded.activated();
		}

		// Faves: short comment marker
		if(mxstorage.getItem('short_comment_marker') == 'true' && isLoggedIn() ) {
			short_comment_marker.activated();
		}

		// Custom list styles
		if(mxstorage.getItem('highlight_forum_categories') == 'true') {
			highlight_forum_categories.activated();
		}
		
		// Refresh faves
		if(isLoggedIn()) {
			update_fave_list.activated();
		}

		// Make readed all faves
		if(isLoggedIn()) {
			make_read_all_faves.activated();
		}
		
		// Message center
		if(mxstorage.getItem('message_center') == 'true' && isLoggedIn() ) {
			message_center.init();
		}
		
		//Night mode
		if (mxstorage.getItem('show_navigation_buttons_night') == 'true' && mxstorage.getItem('navigation_button_night_state') == 'true') {
			lights.forum_switchOn();
		}
	}
	
	// LISTAZAS.PHP
	else if(document.location.href.match('\/forum\/tema')) {

		// Settings
		cp.init(2);

		// Maxthon css inject fix
		injectCss.init(2);

		// Get topic ID for whitelist check
		var id = $('select[name="id"] option:selected').val();
		// Determining current status
		var whitelist = new Array();

		if(whitelist.indexOf(id) == -1) {

			// setPredefinedVars
			setPredefinedVars();
		
			// Monitor the new comments
			if(mxstorage.getItem('fetch_new_comments') == 'true') {
				fetch_new_comments_in_topic.init();
			}

			// Message Center
			if(mxstorage.getItem('message_center') == 'true' && isLoggedIn() ) {
				message_center.topic();
			}
		
			//gradual_comments
			if(mxstorage.getItem('threaded_comments') == 'true') {
				threaded_comments.activated();
			}
		
			// Jump the last unreaded message
			if(mxstorage.getItem('jump_unreaded_messages') && isLoggedIn() ) {
				jump_unreaded_messages.topic();
			}
		
			// Set-up block buttons
			add_to_list.init();
		
			// Block users/messages
			if(mxstorage.getItem('block_list') != '') {
				blocklist.hidemessages();
			}
		
			// Load next page when scrolling down
			if(mxstorage.getItem('autoload_next_page') == 'true') {
				autoload_next_page.activated();
			}

			// Scroll to page top button
			if(mxstorage.getItem('show_navigation_buttons') == 'true') {
				show_navigation_buttons.activated();
			}

		
			// Animated replyto
			replyTo();

			// Overlay reply-to
			if(mxstorage.getItem('overlay_reply_to') == 'true') {
				overlay_reply_to.activated();
			}
		
			// highlight_comments_for_me
			if(mxstorage.getItem('highlight_comments_for_me') == 'true' && isLoggedIn()) {
				highlight_comments_for_me.activated();
			}
		
			// show menitoned comment
			if(mxstorage.getItem('show_mentioned_comments') == 'true') {
				show_mentioned_comments.activated();
			}

			// WYSIWYG Editor
			if(mxstorage.getItem('wysiwyg_editor') == 'true') {
				wysiwyg_editor.activated();
			}

			if(mxstorage.getItem('disable_point_system') == 'true') {
				disable_point_system.activated();
			}

			// Auto resizing textarea
			textarea_auto_resize.init();

			if(mxstorage.getItem('profiles') != '') {
				profiles.init();
			}

			if(mxstorage.getItem('columnify_comments') == 'true') {
				columnify_comments.activated();
			}

			//Quick user info button
			if(mxstorage.getItem('quick_user_info') == 'true') {
				quick_user_info.activated();
			}

			//Removes the default YT embed code and replace it for faster page load
			if(mxstorage.getItem('better_yt_embed') == 'true') {

				//Check if the script should run or not
				if($('embed').length >= mxstorage.getItem('youtube_embed_limit'))
					better_yt_embed.activated();
			}

			//Pasted text will be a hyperlink, picture, video automatically
			if(mxstorage.getItem('quick_insertion') == 'true') {
				quick_insertion.activated();
			}

			// Dedicated spoiler button
			if(mxstorage.getItem('spoiler_button') == 'true') {
				spoiler_button.activated();
			}

			tempScript.activated();

		// Topic if whitelisted, show the navigation
		// buttons for removal
		} else {
			show_navigation_buttons.activated();
		}	

	}

	// GLOBAL SCRIPTS

		// remove adverts
		if(mxstorage.getItem('remove_ads') == 'true') {
			remove_adds.activated();
		}
}


// Filter out iframes
// Request settings object
if (window.top === window) {
	//rt.post({ name : "getSettings" , message : "getSettings"});
	rt.post( "getSettings", [{ name : "getSettings", message : "localStorage" }] );
}

/*port.onMessage.addListener(function(event) {

	if(event.name == 'setSettings') {
	
		// Save localStorage data
		dataStore = event.message;
	
		// Add domready event
		$(document).ready(function() {
			extInit();
		});
	
	} else if(event.name == 'updateDataStore') {
		
		// Update dataStore with the new data
		dataStore = event.message;

		// Save changes to sync
		if(dataStore['sync_status') == 'true') {
			sync_cp.save();
		}		
	}
});*/

