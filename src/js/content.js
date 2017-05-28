// Predefined vars
//noinspection JSDuplicatedDeclaration
var userName, dataStore;

//noinspection JSUnresolvedFunction
var port = chrome.extension.connect();

function convertBool(string) {

	//noinspection JSUnresolvedFunction
	switch (string.toLowerCase()) {
		case "true":case "yes":case "1":
		return true;
		case "false":case "no":case "0":
		case null:
			return false;
		default:
			return Boolean(string);
	}
}

//noinspection JSDuplicatedDeclaration
function isLoggedIn() {

	// Article page
	if (document.location.href.match(/cikkek/)) {
		return $('form[name="newmessage"]').length;

		// Forum main page
	} else if (document.location.href.match(/forum\/$/)) {
		return $('.user-hello').length;

		// Topic page
	} else if (document.location.href.match(/forum\/tema/)) {
		return $('#comments-login').length;
	}
}

function getUserName() {

	// Article page
	if (document.location.href.match(/cikkek/)) {
		return $('#msg-head').find('b a').html();

		// Forum main page
	} else if (document.location.href.match(/forum\/$/)) {
		return $('.user-hello').text().match(/Üdv, (.*)!/)[1];

		// Topic page
	} else if (document.location.href.match(/forum\/tema/)) {
		return $('#comments-login').find('span').text();
	}
}

function setPredefinedVars() {

	var loggedIn = isLoggedIn();

	if (loggedIn) {
		userName = getUserName();
	}
}

var chat_hide = {

	activated: function () {

		$('#forum-chat').hide();
		$('#forum-wrap').find('.blue-border-top').hide();
		$('#forum-wrap').find('.forums-block:first').css({'margin-top': '0px'});
	},

	disabled: function () {

		$('#forum-chat').show();
		$('#forum-wrap').find('.blue-border-top').show();
		$('#forum-wrap').find('.forums-block:first').css({'margin-top': '35px'});
	}
};

var jump_unreaded_messages = {

	activated: function () {

		var msgPerPage = dataStore['msg_per_page'];

		$('#favorites-list').find('span').find('a').each(function () { //.ext_faves'

			// If theres a new message
			if ($(this).find('span[class="new"]').length > 0) {

				// Get the new messages count
				var newMsg = parseInt($(this).find('span[class="new"]').html().match(/\d+/g));

				// Get last msn's page number
				var page = Math.ceil(newMsg / msgPerPage);

				// Rewrite the url
				$(this).attr('href', $(this).attr('href') + '?order=desc&page=' + page + '&newmsg=' + newMsg);
				//$(this).attr('href', $(this).attr('href') + '#last-read');

				// Remove newmsg var from link
			} else if ($(this).attr('href').indexOf('&order') !== -1) {

				var start = $(this).attr('href').indexOf('&order');

				$(this).attr('href', $(this).attr('href').substring(0, start));
			}
		});
	},

	disabled: function () {

		$('#favorites-list').find('a').each(function () {

			if ($(this).attr('href').indexOf('&order') !== -1) {

				var start = $(this).attr('href').indexOf('&order');

				$(this).attr('href', $(this).attr('href').substring(0, start));
			}
		});
	},

	topic: function () {
		var msgPerPage = dataStore['msg_per_page'];
		// Get new messages counter
		var newMsg = document.location.href.split('&newmsg=')[1];
		// Return if there is not comment counter set
		if (typeof newMsg === "undefined" || newMsg === '' || newMsg === 0) {
			return false;
		}

		// Get the last msg
		var lastMsg = newMsg % msgPerPage;
		var target;
		var last_read = $('a#last-read');

		// Target comment element
		if ($('.ext_new_comment').length > 0) {
			target = $('.ext_new_comment:first').closest('li.forum-post');

		} else if (last_read.length > 0) {
			target = last_read.prev();

			// Insert the horizontal rule
			$('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr');

		} else {
			target = $('.topichead').closest('center').eq(lastMsg - 1);

			// Insert the horizontal rule
			//noinspection JSCheckFunctionSignatures
			$('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr');
		}

		// Append hr tag content if any
		//var content = $('a#last-read').find('li.forum-post').insertBefore('a#last-read');

		// Remove original hr tag
		last_read.remove();

		// Url to rewrite
		/*var url = document.location.href.replace(/?order=desc&page=\d+/gi, "");*/
		var url = document.location.href.replace(/&newmsg=\d+/gi, "");

		// Update the url to avoid re-jump
		history.replaceState({page: url}, '', url);

		// Call the jump method with 1 sec delay
		setTimeout(function () {
			jump_unreaded_messages.jump();
		}, 1000);

		// Add click event the manual 'jump to last msg' button
		$('a[href*="#last-read"]').click(function (e) {
			e.preventDefault();
			jump_unreaded_messages.jump();
		});
	},


	jump: function () {

		var hr = $('#ext_unreaded_hr');
		if (!hr) {
			return false;
		}

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(hr).outerHeight() / 2;
		var targetTop = $(hr).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);

		// Scroll to target element
		$('body').animate({scrollTop: targetOffset}, 500);
	}

};

var fav_show_only_unreaded = {

	opened: false,

	init: function () {

		if (dataStore['fav_show_only_unreaded_remember'] === 'true') {
			fav_show_only_unreaded.opened = false;
		}
		if (convertBool(dataStore['fav_show_only_unreaded_opened']) === 'true') {
			$('#favorites-open-close-button').find('#icon').html('-');
		}
	},

	activated: function () {

		var ext_faves = $('.ext_faves');

		// Remove original toggle button
		$('div[class*="csakujuzi"]').remove();

		// Remove style tags from faves containers
		ext_faves.next().children('nav').removeAttr('style');

		// Disable page auto-hide function
		setCookie('favs', 'true', 365);

		// Move the button away to place toggle button
		$('#ext_refresh_faves').css('right', 18);
		$('#ext_read_faves').css('right', 36);

		var fav_list = $('#favorites-list');
		var ext_wrapper = $('#ext_nav_faves_wrapper');
		var ext_filtered_faves = $('#ext_show_filtered_faves');
		var ext_filtered_faves_arrow = $('#ext_show_filtered_faves_arrow');
		var ext_filtered_error = $('#ext_filtered_faves_error');
		var Alllength = fav_list.find('a[class*="category-"]').length;
		var unreaded_length = fav_list.find('a[class^="category-"][class*="fav-not-new-msg"]').length;

		//Fix
		if (typeof unreaded_length === 'undefined') {
			unreaded_length = 0;
		}

		// Remove old toggle button if any
		ext_filtered_faves.remove();

		// Set the toggle button
		if (ext_wrapper.length) {
			ext_wrapper.prepend('<div id="ext_show_filtered_faves"></div>');
		} else {
			ext_faves.next().append('<div id="ext_show_filtered_faves"></div>');
		}
		ext_filtered_faves.append('<span id="ext_show_filtered_faves_arrow"></span>');

		// Apply some styles
		ext_filtered_faves_arrow.attr('class', 'show');

		// Set event handling
		$('#favorites-open-close-button').on('click', function (e) {
			e.preventDefault();
			if (fav_show_only_unreaded.opened === false) {
				// nyitva
				// Show topics with no new msg
				ext_filtered_error.hide();
				ext_filtered_faves_arrow.attr('class', 'hide');
				fav_list.find('.fav-not-new-msg').hide();

				fav_show_only_unreaded.opened = true;

				// Update last state in LocalStorage
				port.postMessage({name: "updateFavesFilterLastState", message: true});
				port.postMessage({name: "fav_show_only_unreaded_opened", message: true});

				// Reposition the popup if any
				if ($(this).closest('#ext_nav_faves_wrapper').length) {
					show_navigation_buttons.findPosition(ext_wrapper, $('#ext_nav_faves'));
				}

			} else {

				// Don't show topics with new msg
				ext_filtered_error.show();
				ext_filtered_faves_arrow.attr('class', 'show');
				fav_list.find('.fav-not-new-msg').show(); //.ext_hidden_fave

				fav_show_only_unreaded.opened = false;

				// Update last state in LocalStorage
				port.postMessage({name: "updateFavesFilterLastState", message: false});
				port.postMessage({name: "fav_show_only_unreaded_opened", message: false});

				// Reposition the popup if any
				if ($(this).closest('#ext_nav_faves_wrapper').length) {
					show_navigation_buttons.findPosition(ext_wrapper, $('#ext_nav_faves'));
				}
			}
		});

		// Create an error message if theres no topik with unreaded messages
		if (Alllength === unreaded_length && ext_filtered_error.length === 0) {
			ext_faves.after('<p id="ext_filtered_faves_error">Nincs olvasatlan téma</p>');
		}

		// Check opened status
		if (fav_show_only_unreaded.opened === true) {
			ext_filtered_error.hide();
			ext_filtered_faves_arrow.attr('class', 'hide');
			$('.fav-not-new-msg').show();
		}
		else {
			ext_filtered_error.show();
			ext_filtered_faves_arrow.attr('class', 'show');
			fav_list.find('.fav-not-new-msg').hide();
		}
	},

	disabled: function () {

		// Remove toggle button
		$('#ext_show_filtered_faves').remove();

		// Put back the buttons to the right side
		//$('#ext_refresh_faves').css('right', 0);
		$('#ext_read_faves').css('right', 18);
	}
};


var short_comment_marker = {

	activated: function () {

		$('#favorites-list').find('a').each(function () {

			if ($(this).find('span[class*=new]').length > 0) {

				// Received new messages counter
				var newMsg = parseInt($(this).find('span[class=new]').html().match(/\d+/g)); // \d - non-digit character

				// Remove the old marker text
				$(this).find('span[class*=new]').hide();
				/*$(this).find('font:last').hide();*/

				// Add the new marker after the topic title
				$(this).html($(this).html() + ' <span class="ext_short_comment_marker" style="color: red;">' + newMsg + '</span>');
			}
		});
	},

	disabled: function () {

		$('#favorites-list').find('a').each(function () {

			if ($(this).find('span[class*=new]').length > 0) {

				// Show old marker text
				$(this).find('span[class*=new]').show();

				// Remove ext_short_comment_marker
				$(this).find('.ext_short_comment_marker').remove();
			}
		});
	}
};

var blocklist = {

	hidemessages: function () {

		// Return false if theres no blocklist entry
		if (typeof dataStore['block_list'] === "undefined" || dataStore['block_list'] === '') {
			return false;
		}

		var deletelist = dataStore['block_list'].split(',');

		$('.forum-post').find('header').each(function () {
			var nick;
			if (document.location.href.match(/cikkek/)) {

				nick = $(this).find('a:first').html();

			} else {

				if ($(this).find('a img').length === 1) {
					nick = $(this).find('a img').attr('alt');
				} else {
					nick = $(this).find('a#name').text();
				}

				nick = nick.replace(/ - VIP/, "");
			}

			for (var i = 0; i < deletelist.length; i++) {
				if (nick.toLowerCase() === deletelist[i].toLowerCase()) {
					$(this).closest('li.forum-post').hide();
				}
			}
		});
	},

	block: function (el) {

		var nick = '';

		var anchor = $(el).closest('#forum-posts-list ul li header').find('a[href*="/felhasznalo"]');
		var tmpUrl = anchor.attr('href');

		if (anchor.children('img').length > 0) {
			nick = anchor.children('img').attr('title').replace(" - VIP", "");

		} else {
			nick = anchor.html().replace(" - VIP", "");
		}

		if (confirm('Biztos tiltólistára teszed "' + nick + '" nevű felhasználót?')) {

			$('.forum-post').find('header a[href="' + tmpUrl + '"]').each(function () {

				// Remove the comment
				$(this).closest('li.forum-post').animate({height: 0, opacity: 0}, 500, function () {
					$(this).hide();
				});
			});

			// Store new settings in localStorage
			port.postMessage({name: "addToBlocklist", message: nick});

			// Add name to blocklist
			$('<li><span>' + nick + '</span> <a href="#">töröl</a></li>').appendTo('#ext_blocklist');

			// Remove empty blocklist message
			$('#ext_empty_blocklist').remove();
		}
	},

	unblock: function (user) {

		$('.forum-post').find('header').each(function () {

			var nick;
			if (document.location.href.match(/cikkek/)) {

				nick = $(this).find('a:first').html();
			} else {

				if ($(this).find('a img').length === 1) {
					nick = $(this).find('a img').attr('alt');
				} else {
					nick = $(this).find('a#name').text();
				}

				nick = nick.replace(/ - VIP/, "");
			}

			if (nick.toLowerCase() === user.toLowerCase()) {

				// Show temporary the comment height
				$(this).closest('li.forum-post').css({display: 'block', height: 'auto'});

				// Get height
				var height = $(this).closest('li.forum-post').height();

				// Set back to invisible, then animate
				$(this).closest('li.forum-post').css({height: 0}).animate({opacity: 1, height: height}, 500);
			}
		});
	}
};

var highlight_forum_categories = {

	activated: function () {
		$('nav#favorites-list a.category').css({
			'color': '#ffffff',
			'background-color': '#6c9ff7',
			'padding': '2px'
		});
	},

	disabled: function () {
		$('nav#favorites-list a.category').css({
			'color': '#444',
			'background-color': '#fff',
			'padding': '0px'
		});
	}
};

var autoload_next_page = {

	progress: false,
	currPage: null,
	maxPage: null,
	counter: 0,

	activated: function () {

		// Artcile
		if (document.location.href.match(/cikkek/)) {

			// Current page index
			autoload_next_page.currPage = 1;

			// Get topic ID
			var topic_id = $('section#forum-posts').data('topic-id');

			// Get the topic page to determinate max page number
			$.ajax({
				url: 'forum/tema/' + topic_id,
				dataType: 'html',
				success: function (data) {

					// Parse the response HTML
					var tmp = $(data);

					// Fetch the max page number
					autoload_next_page.maxPage = parseInt($(tmp).find('nav.pagination a:last').prev().html());
					//TODO: this is NaN
				}
			});

			// Get max page number 
			autoload_next_page.maxPage = parseInt($('nav.pagination a:last').prev().html());

			// Topic
		} else {

			// Current page index
			autoload_next_page.currPage = parseInt($('nav.pagination a.current').html());

			// Get max page number - Fix for "Last page"
			var temp = ($('nav.pagination a.last').attr('href'));
			if (temp) {
				autoload_next_page.maxPage = parseInt(temp.substring(temp.lastIndexOf("=") + 1));
			}
		}

		$(document).scroll(function () {
			var body = $('body');
			var docHeight = body.height();
			var scrollTop = body.scrollTop();

			if (docHeight - scrollTop < 3000 && !autoload_next_page.progress && autoload_next_page.currPage < autoload_next_page.maxPage) {
				autoload_next_page.progress = true;
				autoload_next_page.load();
			}
		});

	},

	disabled: function () {

		$(document).unbind('scroll');
	},

	load: function () {

		var url;
		// Url to call
		// date ASC order
		if (document.location.href.match(/timeline/)) {
			url = document.location.href.substring(0, 44);
			url = url + '&order=timeline&index=' + (autoload_next_page.currPage + 1) + '';

			// Date DESC order
		} else {

			if (document.location.href.match(/cikkek/)) {

				// Get topic ID
				var topic_id = $('section#forum-posts').data('topic-id');

				// Url to call	
				url = 'forum/tema/' + topic_id;
				url = url + '?page=' + (autoload_next_page.currPage + 1) + '&callerid=1';

			} else {
				url = document.location.href.substring(0, 35);
				url = url + '?page=' + (autoload_next_page.currPage + 1) + '';
			}
		}

		// Make the ajax query
		$.get(url, function (data) {

			// Create the 'next page' indicator
			if (dataStore['threaded_comments'] !== 'true') {
				if (document.location.href.match(/cikkek/)) {
					$('<div class="ext_autopager_idicator">' + (autoload_next_page.currPage + 1) + '. oldal</div>').insertAfter('.std2:last');
				} else {
					$('<div class="ext_autopager_idicator">' + (autoload_next_page.currPage + 1) + '. oldal</div>').insertAfter('div#forum-posts-list:last');
				}
			}

			// Parse the response HTML
			var tmp = $(data);
			var d;

			// Articles
			if (document.location.href.match(/cikkek/)) {

				tmp = tmp.find('div#forum-posts-list');
				tmp = safeResponse.cleanDomHtml(tmp[0]);

				//TODO: fix meh workaround
				d = document.createElement('div');
				d.innerHTML = tmp;
				$(d).insertAfter('.ext_autopager_idicator:last');

				// Topics
			} else {
				tmp = tmp.find('div#forum-posts-list');
				tmp = safeResponse.cleanDomHtml(tmp[0]);

				//TODO: fix meh workaround
				d = document.createElement('div');
				d.innerHTML = tmp;
				$(d).insertAfter('.ext_autopager_idicator:last');
			}

			autoload_next_page.progress = false;
			autoload_next_page.currPage++;
			autoload_next_page.counter++;

			// Reinit settings

			// Set-up block buttons
			add_to_list.init();

			// threaded comments
			if (dataStore['threaded_comments'] === 'true') {
				threaded_comments.sort();
			}

			// highlight_comments_for_me
			if (dataStore['highlight_comments_for_me'] === 'true' && isLoggedIn()) {
				highlight_comments_for_me.activated();
			}

			// Profiles
			if (dataStore['profiles'] !== '') {
				profiles.init();
			}

			if (dataStore['columnify_comments'] === 'true') {
				columnify_comments.activated();
			}

			if (dataStore['quick_user_info'] === 'true') {
				quick_user_info.activated();
			}

			//Night mode
			if (dataStore['show_navigation_buttons_night'] === 'true' && dataStore['navigation_button_night_state'] === 'true') {
				lights.forum_switchOn();
			}
		}, 'html');
	}

};

var show_navigation_buttons = {

	activated: function () {

		// Create the scrolltop button
		$('<div id="ext_scrolltop" title="Ugrás az oldal tetejére">&#9650;</div>').prependTo('body');
		// Created the back button
		$('<div id="ext_back" title="Főoldal">&#9664;</div>').prependTo('body');

		var ext_scrolltop = $('#ext_scrolltop');
		var ext_back = $('#ext_back');
		var ext_nav_faves = '';
		var ext_nightmode = '';
		var ext_search = '';
		var ext_whitelist = '';

		// Add click event to scrolltop button
		ext_scrolltop.on('click', function () {
			$('body').animate({scrollTop: 0}, 1000);
		});

		// Add event to back button
		ext_back.on('click', function () {
			if (document.location.href.match(/cikkek/)) {
				document.location.href = 'https://sg.hu/';
			} else {
				document.location.href = 'https://sg.hu/forum/';
			}
		});

		if (!document.location.href.match(/cikkek/) && !document.location.href.match(/uzenetek/)) {

			// Create search button
			$('<div id="ext_search" title="Keresés"></div>').prependTo('body');

			// Place search overlay arrow
			$('<div id="ext_overlay_search_arrow"></div>').appendTo('body');

			ext_search = $('#ext_search');

			// Place search icon background
			ext_search.css('background-image', 'url(' + chrome.extension.getURL('/img/content/search.png') + ')');

			// Create the search event
			ext_search.on('click', function () {
				if ($('#ext_overlay_search').length) {
					show_navigation_buttons.removeOverlay();
				} else {
					show_navigation_buttons.showSearch();
				}
			});

			// Get topic ID
			//var id = $('nav#breadcrumb select option:selected').val();
			var id = $('form[name=newmessage]').find('input[name=cid]').val();

			// Determining current status
			var status, title = '';
			var whitelist = dataStore['topic_whitelist'].split(',');

			if (whitelist.indexOf(id) === -1) {
				status = '+';
				title = 'Téma hozzáadása a fehérlistához';
			} else {
				status = '-';
				title = 'Téma eltávolítása a fehérlistából';
			}

			// Create the whitelist button
			$('<div id="ext_whitelist" title="' + title + '">' + status + '</div>').prependTo('body');

			ext_whitelist = $('#ext_whitelist');

			// Create whitelist event
			ext_whitelist.click(function () {

				topic_whitelist.execute(this);

			});
		}

		// Execute when the user is logged in
		if (isLoggedIn() || document.location.href.match(/uzenetek/)) {

			// Create faves button
			$('<div id="ext_nav_faves" title="Kedvencek"></div>').prependTo('body');

			ext_nav_faves = $('#ext_nav_faves');

			// Place the faves icon
			ext_nav_faves.css('background-image', 'url(' + chrome.extension.getURL('/img/content/star.png') + ')');

			// Place faves opened cotainer
			$('<p id="ext_nav_faves_arrow"></p>').prependTo('body');
			$('<div id="ext_nav_faves_wrapper"></div>').prependTo('body');
			$('<div class="ext_faves"><h5>Kedvencek</h5></div>').appendTo('#ext_nav_faves_wrapper');
			$('<div class="ext_nav_fave_list"></div>').appendTo('#ext_nav_faves_wrapper');

			// Create faves button event
			ext_nav_faves.click(function () {
				if ($('#ext_nav_faves_wrapper').css('display') === 'none') {
					show_navigation_buttons.showFaves();
				} else {
					show_navigation_buttons.removeOverlay();
				}
			});
		}

		//Night mode
		if (dataStore['show_navigation_buttons_night'] === 'true') {

			lights.init();

			ext_nightmode = $('#ext_nightmode');
		}

		// Set the button positions

		// Gather visible buttons
		var buttons = [];

		if (ext_scrolltop.length) {
			buttons.push('ext_scrolltop');
		}

		if (ext_back.length) {
			buttons.push('ext_back');
		}

		if (ext_search.length) {
			buttons.push('ext_search');
		}

		if (ext_whitelist.length) {
			buttons.push('ext_whitelist');
		}

		if (ext_nightmode.length) {
			buttons.push('ext_nightmode');
		}

		if (ext_nav_faves.length) {
			buttons.push('ext_nav_faves');
		}

		// Reverse the array order for bottom positioning
		if (dataStore['navigation_buttons_position'].match('bottom')) {
			buttons = buttons.reverse();
		}

		// Calculate buttons height
		var height = buttons.length * 36;

		// Calculate the top position
		var top = ( $(window).height() / 2 ) - ( height / 2);

		// Iterate over the buttons
		for (var c = 0; c < buttons.length; c++) {

			if (dataStore['navigation_buttons_position'] === 'lefttop') {

				$('#' + buttons[c]).css({left: 10, right: 'auto', top: 30 + (36 * c), bottom: 'auto'});
			}

			if (dataStore['navigation_buttons_position'] === 'leftcenter') {

				$('#' + buttons[c]).css({left: 10, right: 'auto', top: top + (36 * c), bottom: 'auto'});
			}

			if (dataStore['navigation_buttons_position'] === 'leftbottom') {

				$('#' + buttons[c]).css({left: 10, right: 'auto', bottom: 30 + (36 * c), top: 'auto'});
			}

			if (dataStore['navigation_buttons_position'] === 'righttop') {

				$('#' + buttons[c]).css({right: 10, left: 'auto', top: 50 + (36 * c), bottom: 'auto'});
			}

			if (dataStore['navigation_buttons_position'] === 'rightcenter') {

				$('#' + buttons[c]).css({right: 10, left: 'auto', top: top + (36 * c), bottom: 'auto'});
			}

			if (dataStore['navigation_buttons_position'] === 'rightbottom') {

				$('#' + buttons[c]).css({right: 10, left: 'auto', bottom: 30 + (36 * c), top: 'auto'});
			}
		}
	},

	disabled: function () {

		$('#ext_scrolltop').remove();
		$('#ext_back').remove();
		$('#ext_search').remove();
		$('#ext_whitelist').remove();
		$('#ext_nav_faves').remove();
		$('#ext_nightmode').remove();
	},

	showSearch: function () {

		var ext_search = $('#ext_search');
		var ext_overlay_search_arrow = $('#ext_overlay_search_arrow');

		// Hide opened overlays
		show_navigation_buttons.removeOverlay();

		// Clone and append the original search form to body
		var clone = $('form#search-top').clone().appendTo('body');
		/* $('.lapozo:last').next().next() nem működik*/

		// Add class
		clone.attr('id', 'ext_overlay_search');

		var ext_overlay_search = $('#ext_overlay_search');

		// Set position
		show_navigation_buttons.findArrowPosition(ext_overlay_search_arrow, ext_search);
		show_navigation_buttons.findPosition(ext_overlay_search, ext_search);

		// Show the elements
		ext_overlay_search_arrow.show();
		ext_overlay_search.show();

		// Create the hiding overlay
		show_navigation_buttons.createOverlay();
	},

	showFaves: function () {
		var url = "https://sg.hu/forum/";
		var ext_nav_faves_wrapper = $('#ext_nav_faves_wrapper');
		var ext_nav_faves = $('#ext_nav_faves');
		var ext_nav_faves_arrow = $('#ext_nav_faves_arrow');

		$.ajax({
			url: url,
			mimeType: 'text/html;charset=utf-8',
			dataType: 'html',
			success: function (tmp) {

				var data = $('nav#favorites-list', tmp);

				// Security reasons
				data = safeResponse.cleanDomHtml(data[0]);

				// Write data into wrapper
				$('#ext_nav_faves_wrapper .ext_nav_fave_list').html(data);

				if (dataStore['jump_unreaded_messages'] === 'true') {
					jump_unreaded_messages.activated();
				}

				// Hide topics that doesnt have unreaded messages
				fav_show_only_unreaded.activated();

				// Faves: short comment marker
				if (dataStore['short_comment_marker'] === 'true') {
					short_comment_marker.activated();
				}

				// Set position
				show_navigation_buttons.findArrowPosition(ext_nav_faves_arrow, ext_nav_faves);
				show_navigation_buttons.findPosition(ext_nav_faves_wrapper, ext_nav_faves);

				// Hide opened overlays
				show_navigation_buttons.removeOverlay();

				// Show the container
				ext_nav_faves_wrapper.show();
				ext_nav_faves_arrow.show();

				// Create the hiding overlay
				show_navigation_buttons.createOverlay();
			}
		});
	},

	findArrowPosition: function (ele, target) {

		var vPos;
		// Top
		if (dataStore['navigation_buttons_position'].match('bottom')) {
			vPos = parseInt($(target).css('bottom').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2;
		} else {
			vPos = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2;
		}

		// Left
		if (dataStore['navigation_buttons_position'].match('left')) {

			if (dataStore['navigation_buttons_position'].match('bottom')) {
				$(ele).css({
					'border-color': 'transparent #c0c0c0 transparent transparent',
					top: 'auto',
					bottom: vPos,
					left: 30,
					right: 'auto'
				});
			} else {
				$(ele).css({
					'border-color': 'transparent #c0c0c0 transparent transparent',
					top: vPos,
					bottom: 'auto',
					left: 30,
					right: 'auto'
				});
			}
			// Right
		} else {
			if (dataStore['navigation_buttons_position'].match('bottom')) {
				$(ele).css({
					'border-color': 'transparent transparent transparent #c0c0c0',
					top: 'auto',
					bottom: vPos,
					left: 'auto',
					right: 30
				});
			} else {
				$(ele).css({
					'border-color': 'transparent transparent transparent #c0c0c0',
					top: vPos,
					bottom: 'auto',
					left: 'auto',
					right: 30
				});
			}
		}
	},

	findPosition: function (ele, target) {

		var top, bottom;
		if (dataStore['navigation_buttons_position'] === 'lefttop') {

			top = parseInt($(target).css('top').replace('px', '')) - 15;

			$(ele).css({left: 50, right: 'auto', top: top, bottom: 'auto'});
		}

		if (dataStore['navigation_buttons_position'] === 'leftcenter') {

			top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2;

			$(ele).css({left: 50, right: 'auto', top: top, bottom: 'auto'});
		}

		if (dataStore['navigation_buttons_position'] === 'leftbottom') {

			bottom = parseInt($(target).css('bottom').replace('px', '')) - 15;

			$(ele).css({left: 50, right: 'auto', top: 'auto', bottom: bottom});
		}

		if (dataStore['navigation_buttons_position'] === 'righttop') {

			top = parseInt($(target).css('top').replace('px', '')) - 15;

			$(ele).css({left: 'auto', right: 50, top: top, bottom: 'auto'});
		}

		if (dataStore['navigation_buttons_position'] === 'rightcenter') {

			top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2;

			$(ele).css({left: 'auto', right: 50, top: top, bottom: 'auto'});
		}

		if (dataStore['navigation_buttons_position'] === 'rightbottom') {

			bottom = parseInt($(target).css('bottom').replace('px', '')) - 15;

			$(ele).css({left: 'auto', right: 50, top: 'auto', bottom: bottom});
		}
	},

	createOverlay: function () {
		$('<div id="ext_nav_overlay"></div>').prependTo('body').css({
			position: 'fixed',
			height: '100%',
			width: '100%',
			zIndex: 80
		});
		$('#ext_nav_overlay').click(function () {
			show_navigation_buttons.removeOverlay();
		});
	},

	removeOverlay: function () {

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

	init: function () {

		var state = dataStore['navigation_button_night_state'];

		if (state === "true") {
			state = "On";
			lights.topic_switchOn();
		}
		else {
			state = "Off";
			lights.topic_switchOff();
		}

		// Create the Bulp button
		$('<div id="ext_nightmode" title="Éjszakai mód"></div>').prependTo('body');

		var ext_nightmode = $('#ext_nightmode');

		//Set the proper Bulp button
		ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/img/content/lamp' + state + '.png') + ')');

		// Add click event to Bulp button
		ext_nightmode.click(function () {

			var state = dataStore['navigation_button_night_state'];

			if (state) {

				//Night mode ON
				ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/img/content/lampOff.png') + ')');

				//Save in dataStore
				dataStore['navigation_button_night_state'] = false;

				lights.topic_switchOff();
			} else {

				//Night mode Off
				ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/img/content/lampOn.png') + ')');

				//Save in dataStore
				dataStore['navigation_button_night_state'] = true;

				lights.topic_switchOn();
			}

			var data = dataStore['navigation_button_night_state'];

			// Save in localStorage
			port.postMessage({name: "setSetting", key: 'navigation_button_night_state', val: data});
		});
	},

	topic_switchOn: function () {

		$('body').css('background-image', 'url(' + chrome.extension.getURL('/img/content/background.png') + ')');
		$('nav#menu-family').css({'color': '#807D7D'});
		$('#content').addClass('night_mainTable');
		$('.oldal-path-2').addClass('night_mainTable');
		$('header').addClass('night_topichead');
		$('section.body').addClass('night_p');
		$('li.forum-post a').css({'color': '#F0DC82 !important'});
		$('footer.footer').addClass('night_bottom');
		$('a.show-message').css({'color': '#CC7722 !important'});
		$('#footer-top').css({'opacity': '0.1'});
	},

	topic_switchOff: function () {

		$('body').css('background-image', '');
		$('nav#menu-family').css({'color': 'black'});
		$('#content').removeClass('night_mainTable');
		$('.oldal-path-2').removeClass('night_mainTable');
		$('header').removeClass('night_topichead');
		$('section.body').removeClass('night_p');
		$('li.forum-post a').removeClass('night_p a');
		$('footer.footer').removeClass('night_bottom');
		$('a.show-message').removeClass('night_replyto');
	},

	forum_switchOn: function () {

		$('body').css('background-image', 'url(' + chrome.extension.getURL('/img/content/background.png') + ')');
		$('#content').addClass('night_mainTable');

		//Chat
		/*setTimeout(function() {*/
		$('span, a, h4').css({'color': 'rgb(119, 119, 119)'});
		$('span .new').css({'color': 'rgb(190, 11, 11)'});
		$('#forum-chat-input').css({'background': 'black', 'color': 'rgb(155, 155, 155)'});
		setTimeout(function () {
			$('ul#forum-chat-list li:odd').css({'background-color': 'black'});
			$('ul#forum-chat-list li:even').css({'background-color': '#252525'});
		}, 2000);

	}
};

var update_fave_list = {

	activated: function () {

		// Disable site's built-in auto-update by remove "fkedvenc" ID
		$('#fkedvenc').removeAttr('id');

		// Create refhref button
		$('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<div id="ext_refresh_faves" style="display: inline-block;"></div>]</span>'); // ha lesz blokkok átrendezése, akkor #ext_left_sidebar után már nem kell inline style

		var refresh_faves = $('#ext_refresh_faves');

		// Move the button away if unreaded faves is on
		if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
			refresh_faves.css('right', 18);
		}

		// Set refresh image
		$('<img src="' + chrome.extension.getURL('/img/content/refresh.png') + '">').appendTo('#ext_refresh_faves'); // Erre valamit ki kell találni

		// Add click event
		refresh_faves.on('click', 'img', function () {
			update_fave_list.refresh();
		});

		// Set up auto-update
		setInterval(function () {
			update_fave_list.refresh();
		}, 30000);
	},

	refresh: function () {
		var refresh_img = $('#ext_refresh_faves').find('img');

		// Set 'in progress' icon
		refresh_img.attr('src', chrome.extension.getURL('/img/content/refresh_waiting.png'));

		$.ajax({
			url: 'https://sg.hu/forum/',
			mimeType: 'text/html;charset=utf-8',
			dataType: 'html',

			success: function (data2) {

				var data = $('nav#favorites-list', data2);

				// Filter the response - for security reasons
				data = safeResponse.cleanDomHtml(data[0]);

				// Update fav list
				$("nav#favorites-list").html(data);

				// Set 'completed' icon
				refresh_img.attr('src', chrome.extension.getURL('/img/content/refresh_done.png'));

				// Set back the normal icon in 1 sec
				setTimeout(function () {
					refresh_img.attr('src', chrome.extension.getURL('/img/content/refresh.png'));
				}, 1000);

				// Faves: show only with unreaded messages
				if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
					fav_show_only_unreaded.activated();
				}

				// Faves: short comment marker
				if (dataStore['short_comment_marker'] === 'true' && isLoggedIn()) {
					short_comment_marker.activated();
				}

				// Custom list styles
				if (dataStore['highlight_forum_categories'] === 'true') {
					highlight_forum_categories.activated();
				}

				// Jump the last unreaded message
				if (dataStore['jump_unreaded_messages'] === 'true' && isLoggedIn()) {
					jump_unreaded_messages.activated();
				}

				//Night mode
				if (dataStore['show_navigation_buttons_night'] === 'true' && dataStore['navigation_button_night_state'] === 'true') {
					lights.forum_switchOn();
				}
			}
		});
	}
};

var make_read_all_faves = {

	activated: function () {

		// Create the 'read them all' button
		$('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<div id="ext_read_faves" style="display: inline-block;"></div>]</span>');

		var read_faves = $('#ext_read_faves');
		// Move the button away if unreaded faves is on
		if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
			read_faves.css('right', 36);
		}

		// Append the image
		/*$('<img src="'+chrome.extension.getURL('/img/content/makereaded.png">')+'').appendTo(read_faves);*/
		$('<div id="icon">&#9675;</div>').appendTo('#ext_read_faves');

		// Add click event
		read_faves.click(function () {
			make_read_all_faves.makeread();
		});
	},

	makeread: function () {

		if (confirm('Biztos olvasottnak jelölöd az összes kedvenced?')) {

			// Set 'in progress' icon
			//$('#ext_read_faves').find('img').attr('src', chrome.extension.getURL('/img/content/makereaded_waiting.png') );
			$('#ext_read_faves').find('#icon').html('&#9684;');

			var count = 0;
			var counter = 0;

			var links = $('.ext_faves').find('a');

			// Get unreaded topics count
			links.each(function () {

				// Dont bother the forum categories
				if ($(this).is('.category')) {
					return true;
				}

				// Also dont bother readed topics
				if ($(this).hasClass('fav-not-new-msg')) {
					return true;
				}

				count++;
			});

			// Iterate over all faves
			links.each(function () {

				// Dont bother the forum categories
				if ($(this).is('.category')) {
					return true;
				}

				// Also dont bother readed topics
				if ($(this).hasClass('fav-not-new-msg')) {
					return true;
				}

				var ele = $(this);

				// Make an ajax query to refresh last readed time
				$.get($(this).attr('href'), function () {

					$(ele).find('span.new').remove();
					$(ele).find('.ext_short_comment_marker').remove();

					if (dataStore['fav_show_only_unreaded'] === 'true' && fav_show_only_unreaded.opened === false) {
						$(ele).parent().addClass('ext_hidden_fave');
					}

					counter++;
				}, 'html');
			});

			var interval = setInterval(function () {

				if (count === counter) {

					// Set 'completed' icon / black circle
					$('#ext_read_faves').html('&#9679;');

					// Set normal icon
					setTimeout(function () {
						$('#ext_read_faves').html('&#9675;');
					}, 2000);

					// Faves: show only with unreaded messages
					if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
						fav_show_only_unreaded.activated();
					}

					// Reset faves newmsg vars
					if (dataStore['jump_unreaded_messages'] === 'true' && isLoggedIn()) {
						jump_unreaded_messages.activated();
					}

					clearInterval(interval);
				}

			}, 100);

		}

	}
};

function replyTo() {
	$('.msg-replyto a').on('click', function (e) {

		// Prevent default submisson
		e.preventDefault();

		// Get original link params
		var _params = $(this).attr('href').match(/(msg)?\d+/g);

		// Run replacement funciton
		ext_valaszmsg(_params[0], _params[1], _params[2], _params[3]);
	});
}

function ext_valaszmsg(target, id, no, callerid) {

	var targetSelector = $('#' + target);
	if (targetSelector.css('display') !== 'block') {

		var url;
		if (document.location.href.match(/cikkek/)) {
			// callerid = 1
			url = '/listazas_egy.php3?callerid=' + callerid + '&id=' + id + '&no=' + no;
		} else {
			// callerid = 2
			url = '/listazas_egy.php3?callerid=' + callerid + '&id=' + id + '&no=' + no;
		}

		$.get(url, function (data) {

			data = safeResponse.cleanDomHtml(data);

			// Show the comment
			targetSelector.html(data).hide().slideDown();

			// Maintain style settings
			if (document.location.href.match(/cikkek/)) {
				targetSelector.find('.b-h-o-head a').closest('.b-h-o-head').attr('class', 'b-h-o-head topichead');
				targetSelector.find('.b-h-o-head').css('background', 'url(images/ful_o_bgbg.gif)');
				targetSelector.find('.b-h-o-head .msg-dateicon a').css('color', '#444');
			}

			if (dataStore['disable_point_system'] === 'true') {
				disable_point_system.activated();
			}

			// Set-up block buttons
			add_to_list.init();

			if (dataStore['profiles'] !== '') {
				profiles.init();
			}

			if (dataStore['columnify_comments'] === 'true') {
				columnify_comments.activated();
			}

			if (dataStore['quick_user_info'] === 'true') {
				quick_user_info.activated();
			}

			if (dataStore['show_navigation_buttons_night'] === 'true' && dataStore['navigation_button_night_state'] === 'true') {
				lights.topic_switchOn();
			}

		}, 'html');
	}
	else {
		targetSelector.slideUp();
	}
}

var overlay_reply_to = {

	opened: false,

	activated: function () {

		// Change tabindexes for suit the overlay textarea
		var ta = $('textarea:first');
		ta.attr('tabindex', '3');
		ta.closest('div').find('a:last').attr('tabindex', '4');

		// Change the behavior the replyto button
		$('.post header a:contains("válasz")').on('click', function (e) {

			// Prevent default submission
			e.preventDefault();

			// Get ref msg ID and comment element
			var msgno = $(this).closest('header').find('a.post-no').text().match(/\d+/g);
			var entry = $(this).closest('.post');

			// Call show method
			overlay_reply_to.show(entry, msgno);
		});
	},

	disabled: function () {

		$('li[id*=post] header a:contains("válasz")').off('click');

	},

	show: function (comment, msgno) {

		// Return when the user is not logged in
		if (!isLoggedIn()) {
			alert('Nem vagy bejelentkezve!');
			return;
		}

		// Prevent multiple instances
		if (overlay_reply_to.opened) {
			return false;

			// Set opened status
		} else {
			overlay_reply_to.opened = true;
		}

		var textarea_clone;
		var body = $('body');

		// Create the hidden layer
		$('<div class="ext_hidden_layer"></div>').prependTo('body').hide().fadeTo(300, 0.9);

		// Highlight the reply comment
		var comment_clone = $(comment).clone().prependTo('#forum-posts-list ul').addClass('ext_highlighted_comment');

		// Maintain comment clone positions
		comment_clone.css({'top': comment.position().top});

		// Remove threaded view padding and border
		comment_clone.css({margin: 0, padding: 0, border: 0});

		// Remove 'msg for me' indicator
		comment_clone.find('.ext_comments_for_me_indicator').remove();

		// Remove sub-center tags
		comment_clone.find('ul.post-answer').remove();

		// Remove quoted subcomments
		comment_clone.find('ul.post-answer').remove();
		/*.parent('div') */

		if (document.location.href.match(/cikkek/)) {
			comment_clone.css('width', 700);
		}

		// Create textarea clone

		// WYSIWYG editor
		if (dataStore['wysiwyg_editor'] === 'true') {

			if (document.location.href.match(/cikkek/)) {

				textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body');
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
				textarea_clone = $('form[name="newmessage"]').find('div.cleditorMain').clone(true, true).prependTo('body').addClass('ext_clone_textarea');

				// Add 'article' class to the clone
				textarea_clone.addClass('topic');

				// Remove div padding
				textarea_clone.find('form div:eq(0)').css('padding', 0);
			}

			textarea_clone.find('.cleditorMain').remove();
			textarea_clone.find('form div:eq(0)').append('<textarea cols="50" rows="10" name="message"></textarea>');

			// Copy textarea original comment to the tmp element
			textarea_clone.find('textarea').val($('form[name=newmessage]:gt(0) textarea').val());

			// Apply some styles
			textarea_clone.css({'background': 'none', 'border': 'none'});

			// Fix buttons
			textarea_clone.find('a:eq(0)').css({position: 'absolute', top: 220, left: 0});
			textarea_clone.find('a:eq(1)').css({position: 'absolute', top: 220, left: 90, visibility: 'visible'});
			textarea_clone.find('a:eq(2)').css({display: 'none'});
			textarea_clone.find('a:eq(3)').css({display: 'none'});
			textarea_clone.find('a:eq(4)').css({position: 'absolute', top: 220, left: 180});
			textarea_clone.find('a:eq(5)').css({position: 'absolute', top: 220, left: 270, right: 'auto'});

			textarea_clone.find('a:eq(6)').css({position: 'absolute', top: 220, right: 0});

			// Fix smile list
			if (document.location.href.match(/cikkek/)) {
				textarea_clone.find('#ext_smiles').css({'padding-left': 50, 'padding-right': 50, 'margin-top': 20});
			} else {
				textarea_clone.find('#ext_smiles').css({'padding-left': 100, 'padding-right': 100, 'margin-top': 15});
			}
			textarea_clone.find('.ext_smiles_block h3').css('color', 'black');

			// CLEditor init
			if (document.location.href.match(/cikkek/)) {
				$(".ext_clone_textarea textarea").cleditor({width: 696, height: 200})[0].focus();
				textarea_clone.find('.cleditorMain').css({position: 'relative', top: -10});
			} else {
				$(".ext_clone_textarea textarea").cleditor({width: 800})[0].focus();
			}

			// Normal textarea
		} else {

			if (document.location.href.match(/cikkek/)) {

				textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body');
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

				textarea_clone = $('form[name="newmessage"] textarea').closest('form').clone(true, true).prependTo('body').addClass('ext_clone_textarea');

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
			textarea_clone.find('textarea').val($('form[name=newmessage]:gt(0) textarea').val());

			// Fix buttons
			textarea_clone.find('button:eq(1)').css({position: 'absolute', left: 0}); // -85
			textarea_clone.find('button:eq(2)').css({position: 'absolute', left: 90});  // -175
			textarea_clone.find('button:eq(3)').css({position: 'absolute', left: 180}); // -265
			textarea_clone.find('button:eq(4)').css({position: 'absolute', left: 270}); // -375
			textarea_clone.find('button:eq(5)').css({position: 'absolute', left: 380}); // -486
			textarea_clone.find('button:eq(6)').css({position: 'absolute', left: 491}); // -608
			textarea_clone.find('button:eq(7)').css({position: 'absolute', left: 613}); // -711,52

			/*textarea_clone.find('a:eq(6)').css({ position : 'absolute', right : 0 });*/
		}

		// Textarea position
		var top = $(comment_clone).offset().top + $(comment_clone).height();
		var left;
		if (document.location.href.match(/cikkek/)) {
			left = $(document).width() / 2 - 350;
		} else {
			left = $(document).width() / 2 - 475;
		}

		textarea_clone.delay(350).css({top: top + 200, left: left, opacity: 0}).animate({
			top: top + 10,
			opacity: 1
		}, 300);

		// Change textarea name attr to avoid conflicts
		$('form[name=newmessage]:gt(0)').attr('name', 'tmp');

		// Set msg no input
		textarea_clone.find('input[name=no_ref]').attr('value', msgno);

		// Autoscroll
		$('html, body').animate({
			scrollTop: comment.offset().top - $(window).height() / 3
		}, 500);

		// Set the right tabindex
		textarea_clone.find('textarea').attr('tabindex', '1');
		textarea_clone.find('a:last').attr('tabindex', '2');

		// Set the textarea focus
		textarea_clone.find('textarea').focus();

		// Set the iframe focus
		if (dataStore['wysiwyg_editor'] === 'true') {
			textarea_clone.find('iframe')[0].focus();
		}

		// Block default tab action in non-WYSIWYG editor
		body.keydown(function (event) {
			if (event.keyCode === 9) {
				event.preventDefault();
				textarea_clone.find('a:last').focus();
			}
		});

		// Block default tab action in a WYSIWYG editor
		if (dataStore['wysiwyg_editor'] === 'true') {
			$(textarea_clone.find('iframe')[0].contentDocument.body).keydown(function (event) {
				if (event.keyCode === '9') {
					event.preventDefault();
					textarea_clone.find('a:last').focus();
				}
			});
		}

		// Thickbox
		textarea_clone.find('a.thickbox').each(function () {

			// Get the title and other stuff
			var t = $(this).attr('title') || $(this).attr('name') || null;
			var g = $(this).attr('rel') || false;
			var h = $(this).attr('href');

			$(this).attr('href', 'javascript:TB_show(\'' + t + '\',\'' + h + '\',' + g + ');');

			$(this).blur();
		});

		// Add close button
		var close_btm = $('<img src="' + chrome.extension.getURL('img/content/overlay_close.png') + '" id="ext_close_overlay">').prependTo(textarea_clone).addClass('ext_overlay_close');

		// Change close button position if WYSIWYG editor is disabled
		if (dataStore['wysiwyg_editor'] !== true) {
			close_btm.css({'right': 4, 'top': 9});
		}

		// Add Close event
		$(close_btm).click(function () {
			$(textarea_clone).fadeTo(100, 0, function () {
				$(this).remove();
				$(comment_clone).fadeTo(100, 0, function () {
					$(this).remove();
					$('.ext_hidden_layer').fadeTo(300, 0, function () {
						$(this).remove();
						$('form[name=tmp]:first').attr('name', 'newmessage');

						// Set back opened status
						overlay_reply_to.opened = false;

						// Remove keydown event
						body.unbind('keydown');
					});
				});
			});
		});
	}
};

var highlight_comments_for_me = {

	activated: function () {

		// Return false when no username set
		if (!userName) {
			return false;
		}

		// Get the proper domnodes
		var comment = $('li[id*="post"] footer a:contains("' + userName + '")');

		//We need exact match with the userName
		var start_pos = comment.text().indexOf('\'') + 1;
		var end_pos = comment.text().indexOf('\'', start_pos);
		var TesTcomment = comment.text().substring(start_pos, end_pos);
		var comments;

		if (TesTcomment === userName) {
			comments = comment.closest('li');
		}

		if (comments !== undefined) {

			// Iterate over them
			comments.each(function () {

				if ($(this).find('.ext_comments_for_me_indicator').length === 0) {

					$(this).css('position', 'relative').append('<img src="' + chrome.extension.getURL('/img/content/comments_for_me_indicator.png') + '" class="ext_comments_for_me_indicator">');

					if (document.location.href.match(/cikkek/)) {
						$(this).find('.ext_comments_for_me_indicator').addClass('article');
					} else {
						$(this).find('.ext_comments_for_me_indicator').addClass('topic');
					}
				}
			});
		}
	},

	disabled: function () {

		$('.ext_comments_for_me_indicator').remove();
	}
};

var threaded_comments = {

	activated: function () {

		// New message counter
		var newMsg = document.location.href.split('&newmsg=')[1];

		// Mark new messages if any
		if (typeof newMsg !== "undefined" && newMsg !== '') {
			$('.header:lt(' + newMsg + ')').find('a:last').after($('<span class="thread_sep"> | </span> <span class="ext_new_comment" style="color: red;">ÚJ</span>'));
		}

		// Set prev and next button if any new messages
		if (newMsg > 0) {

			$('<span class="thread_prev">&laquo;</span>').insertBefore('.ext_new_comment');
			$('<span class="thread_next">&raquo;</span>').insertAfter('.ext_new_comment');

			// Bind events
			$('.thread_prev').on('click', function () {
				threaded_comments.prev(this);
			});

			$('.thread_next').on('click', function () {
				threaded_comments.next(this);
			});
		}

		// Sort comments to thread
		threaded_comments.sort();
	},


	prev: function (ele) {
		// Get the index value of the current element
		var index = $(ele).index('.thread_prev');

		// Check if is it the first element
		if (index === 0) {
			return false;
		}

		var target = $('.ext_new_comment').eq((index - 1)).closest('.post').children('header');

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);

		// Scroll to target element
		$('body').animate({scrollTop: targetOffset}, 500);
	},

	next: function (ele) {
		var ext_new_comment = $('.ext_new_comment');

		// Get the index value of the current element
		var index = $(ele).index('.thread_next');

		// Check if is it the last element
		if (index + 1 >= ext_new_comment.length) {
			return false;
		}

		var target = ext_new_comment.eq((index + 1)).closest('.post').children('header');

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);

		// Scroll to target element
		$('body').animate({scrollTop: targetOffset}, 500);
	},

	sort: function () {

		// Sort to thread
		$($('.post:not(.checked)').get().reverse()).each(function () {

			// Check if theres an answered message
			if ($(this).find('.reply').length === 0) {

				// Add checked class
				$(this).addClass('checked');

				// Return 'true'
				return true;
			}

			// Get answered comment numer
			var commentNum = $(this).find('.reply').text().split('#')[1].match(/\d+/g);

			// Seach for parent node via comment number
			$(this).appendTo( $('.header a:contains("#' + commentNum[0] + '"):last').closest('.post') );

			// Set style settings
			if (document.location.href.match(/cikkek/)) {
				$(this).css({'margin-left': 0, 'padding-left': 15, 'border-left': '1px solid #ddd'});
				$(this).css('width', 604 - $(this).parents('.post').length * 16);
				$(this).find('.reply').hide();
			} else {
				$(this).css({'margin-left': 0, 'padding-left': 20, 'border-left': '1px solid #ddd'});
				$(this).css('width', 930 - ($(this).parents('.post').length) * 21);
				$(this).find('.reply').hide();
			}

			// Add checked class
			$(this).find('.topichead:first').addClass('checked');

		});
	}
};

var fetch_new_comments_in_topic = {

	counter: 0,
	last_new_msg: 0,
	last_new_msg_counter: 0,
	locked: false,

	init: function () {

		// // Set new messages number to zero
		// newMessage.html('0 új hozzászólás érkezett!');
		// Monitor new comments nofification
		setInterval(function () {

			var newMessage = $('span#newMessage');

			if (newMessage.length === 0) {
				return false;
			}

			// Hide the notification when fetch new comments settgngs is enabled
			if (dataStore['fetch_new_comments'] === 'true') {
				newMessage.css({
					display: 'none !important',
					visibility: 'hidden',
					height: 0,
					margin: 0,
					padding: 0,
					border: 0
				});
			}

			// Get new comments counter
			var newmsg = parseInt(newMessage.text().match(/\d+/g));

			if (newmsg > fetch_new_comments_in_topic.last_new_msg && fetch_new_comments_in_topic.locked === false) {

				// Rewrite the notification url
				fetch_new_comments_in_topic.rewrite();

				// Fetch the comments if this option is enabled
				// Set locked status to prevent multiple requests
				if (dataStore['fetch_new_comments'] === 'true') {
					fetch_new_comments_in_topic.locked = true;
					fetch_new_comments_in_topic.fetch();
				}
			}
		}, 1000);
	},

	rewrite: function () {

		var newMessage = $('span#newMessage');

		/*var topic_url = $('a#forum-new-messages').attr('href').substring(0, 12);*/
		var topic_url = newMessage.attr('href');
		var comment_c = newMessage.text().match(/\d+/g);

		newMessage.attr('href', topic_url + '&newmsg=' + comment_c);
	},

	fetch: function () {

		// Check the page number
		var page = parseInt($('nav.pagination a:first').text());

		// Do nothing if we not in the first page
		if (page !== 1) {
			return false;
		}

		// Get new comments counter
		//var newmsg = parseInt($('span#newMessage').text().match(/\d+/g));

		// Update the newmsg
		//var new_comments = newmsg - fetch_new_comments_in_topic.last_new_msg;

		// Update the last new msg number = newmsg
		fetch_new_comments_in_topic.last_new_msg = parseInt($('span#newMessage').text().match(/\d+/g));

		// Get the topik ID and URL
		var id = $('#topicdata').data('tid');
		//noinspection JSUnresolvedVariable
		var hsz = $('.post:first').data('post-info').msg_unique + 1;
		// var url = 'https://sg.hu/api/forum/message?topicId=' + id + '&unique=' + hsz;
		var url = 'https://sg.hu/forum/uzenet/' + id + '/' + hsz;

		// Get topic contents
		$.ajax({
			url: url,
			contentType: 'text/html; charset=utf-8',
			dataType: 'html',

			success: function (data) {

				// Increase the counter
				fetch_new_comments_in_topic.counter++;

				// Append horizonal line
				if (fetch_new_comments_in_topic.counter === 1) {
					//noinspection JSCheckFunctionSignatures
					$('<hr>').insertBefore( $('.post:first') ).attr('id', 'ext_unreaded_hr');
				}

				// Parse the content
				var tmp = $(data);

				// Fetch new comments
				var comments = $(tmp).find('.post');

				// Filter the response - for security reasons
				comments = safeResponse.cleanDomHtml(comments[0]);

				// Append new comments
				$('#forum-posts-list').find('ul').prepend( comments );

				// Remove locked status
				fetch_new_comments_in_topic.locked = false;

				// Reinit settings

				// Set-up block buttons
				add_to_list.init();

				// highlight_comments_for_me
				if (dataStore['highlight_comments_for_me'] === 'true' && isLoggedIn()) {
					highlight_comments_for_me.activated();
				}

				// User profiles
				if (dataStore['profiles'] !== '') {
					profiles.init();
				}

				//Quick user info button
				if (dataStore['quick_user_info'] === 'true') {
					quick_user_info.activated();
				}

				//
				if (dataStore['show_navigation_buttons_night'] === 'true' && dataStore['navigation_button_night_state'] === 'true') {
					lights.topic_switchOn();
				}
			}
		});
	}
};

var custom_blocks = {

	activated: function () {

		// Set blocks IDs
		custom_blocks.setIDs();

		// Check localStorage for config
		if (typeof dataStore['blocks_config'] === 'undefined' || dataStore['blocks_config'] === '') {
			custom_blocks.buildConfig();
		}

		// Execute config
		custom_blocks.executeConfig();

		// Set overlays
		if (dataStore['hide_blocks_buttons'] === 'false' || typeof dataStore['hide_blocks_buttons'] === 'undefined') {
			custom_blocks.setOverlay();
		}

	},

	disabled: function () {

		$('.ext_blocks_buttons').remove();
	},

	setIDs: function () {

		// Blocks counter
		var counter = 1;

		// Left side blocks
		$('.ext_left_sidebar > section, #forum-chat, .forum-topics-block, .ext_right_sidebar > section').each(function () {

			// Set the ID
			$(this).addClass('ext_block block-' + counter);

			// Increase the counter
			counter++;
		});
	},

	buildConfig: function () {

		// Var for config
		var config = [];

		// Iterate over the blocks
		$('.ext_block').each(function (index) {

			var tmp = {

				id: $(this).attr('id'),
				visibility: true,
				contentHide: false,
				side: $(this).parent('#sidebar-forum').length > 0 ? 'left' : 'right',
				index: index
			};
			config.push(tmp);

		});

		// Store in localStorage
		port.postMessage({name: "setBlocksConfig", message: JSON.stringify(config)});

		// Update in dataStore var
		dataStore['blocks_config'] = JSON.stringify(config);
	},

	setConfigByKey: function (id, key, value) {

		var config = JSON.parse(dataStore['blocks_config']);

		for (var c = 0; c < config.length; c++) {

			if (config[c]['id'] === id) {
				config[c][key] = value;
			}
		}

		// Store in localStorage
		port.postMessage({name: "setBlocksConfig", message: JSON.stringify(config)});

		// Update dataStore var
		dataStore['blocks_config'] = JSON.stringify(config);
	},

	getConfigValByKey: function (id, key) {

		var config = JSON.parse(dataStore['blocks_config']);

		for (var c = 0; c < config.length; c++) {

			if (config[c]['id'] === id) {
				return config[c][key];
			}
		}
	},

	reindexOrderConfig: function () {

		// Var for config
		//var config = JSON.parse(dataStore['blocks_config']);
		var _config = [];

		// Iterate over the blocks
		$('.ext_block').each(function (index) {

			var tmp = {

				id: $(this).attr('id'),
				visibility: custom_blocks.getConfigValByKey($(this).attr('class'), 'visibility'),
				contentHide: custom_blocks.getConfigValByKey($(this).attr('class'), 'contentHide'),
				side: $(this).parent('#sidebar-forum').length > 0 ? 'left' : 'right',
				index: index
			};

			_config.push(tmp);

		});

		// Store in localStorage
		port.postMessage({name: "setBlocksConfig", message: JSON.stringify(_config)});
	},

	executeConfig: function () {

		// var ext_left_sidebar = $('#ext_left_sidebar');
		// var ext_right_sidebar = $('#ext_right_sidebar');

		var config = JSON.parse(dataStore['blocks_config']);
		config = config.reverse();
		for (var c = 0; c < config.length; c++) {

			// Visibility
			if (config[c]['visibility'] === false) {
				custom_blocks.hide(config[c]['id'], false);
			}

			// ContentHide
			if (config[c]['contentHide'] === true) {
				custom_blocks.contentHide(config[c]['id'], false);
			}

			// Side and pos
			if (config[c]['side'] === 'left') {

				$('#' + config[c]['id']).prependTo('#sidebar-forum'); //table:eq(3) td:eq(0)

			} else {

				$('#' + config[c]['id']).prependTo('#forum-wrap'); //table:eq(3) td:eq(2) table:first tr > td:eq(2)
			}
		}

		// Maintain style settings
		// ext_left_sidebar.find('.b-h-b-head').removeClass('b-h-b-head').addClass('b-h-o-head');
		// ext_left_sidebar.find('.hasab-head-b').removeClass('hasab-head-b').addClass('hasab-head-o');
		// ext_left_sidebar.find('img[src="images/ful_b_l.png"]').attr('src', 'images/ful_o_l.png');
		//
		// // Maintain style settings
		// ext_right_sidebar.find('.b-h-o-head').removeClass('b-h-o-head').addClass('b-h-b-head');
		// ext_right_sidebar.find('.hasab-head-o').removeClass('hasab-head-o').addClass('hasab-head-b');
		// ext_right_sidebar.find('img[src="images/ful_o_l.png"]').attr('src', 'images/ful_b_l.png');

		// Fix welcome block for private messages
		// $('.ext_welcome:first').next().find('br').css('display', 'inline');

	},

	setOverlay: function () {

		$('.ext_block').each(function () {

			var item = $('<p class="ext_blocks_buttons"></p>').prependTo(this);

			// Contenthide
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/minimalize.png') + '" class="ext_block_button_right">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.contentHide($(this).closest('section').attr('id'), true);
			});

			// Hide
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/close.png') + '" class="ext_block_button_right">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.hide($(this).closest('section').attr('id'), true);
			});


			// Down
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/down.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.down($(this).closest('section').attr('id'), true);
			});

			// Up
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/up.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.up($(this).closest('section').attr('id'), true);
			});

			// Right
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/right.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.right($(this).closest('section').attr('id'), true);
			});
			// Left
			//noinspection JSCheckFunctionSignatures
			$('<img src="' + chrome.extension.getURL('/img/blocks/left.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
				e.preventDefault();
				custom_blocks.left($(this).closest('section').attr('id'), true);
			});

		});
	},

	hide: function (id, clicked) {

		if (clicked === true) {
			// Change the config
			custom_blocks.setConfigByKey(id, 'visibility', false);

			// Hide the item
			$('#' + id).slideUp(200);
		} else {
			$('#' + id).hide();
		}
	},

	contentHide: function (id, clicked) {

		var c_id = $('#' + id).children('div:eq(1)');

		if (clicked === false) {
			c_id.hide();
			return true;
		}

		if (c_id.css('display') === 'none') {

			// Change the config
			custom_blocks.setConfigByKey(id, 'contentHide', false);

			// Hide the item
			c_id.show();

		} else {

			// Change the config
			custom_blocks.setConfigByKey(id, 'contentHide', true);

			// Hide the item
			c_id.hide();
		}
	},

	left: function (id) {
		// var ext_left_sidebar = $('#ext_left_sidebar');
		var c_id = $('#' + id);

		// Check current side settings
		if (c_id.find('.b-h-o-head').length === 0) {

			// Move the block
			c_id.prependTo('#ext_left_sidebar');

			// Maintain style settings
			// ext_left_sidebar.find('.b-h-b-head').removeClass('b-h-b-head').addClass('b-h-o-head');
			// ext_left_sidebar.find('.hasab-head-b').removeClass('hasab-head-b').addClass('hasab-head-o');
			// ext_left_sidebar.find('img[src="images/ful_b_l.png"]').attr('src', 'images/ful_o_l.png');

			// Store data in localStorage
			custom_blocks.reindexOrderConfig();
		}
	},

	right: function (id) {

		// var ext_right_sidebar = $('#ext_right_sidebar');
		var c_id = $('#' + id);

		// Check current side settings
		if (c_id.find('.b-h-b-head').length === 0) {

			// Move the block
			c_id.prependTo('#ext_right_sidebar');

			// Maintain style settings
			// ext_right_sidebar.find('.b-h-o-head').removeClass('b-h-o-head').addClass('b-h-b-head');
			// ext_right_sidebar.find('.hasab-head-o').removeClass('hasab-head-o').addClass('hasab-head-b');
			// ext_right_sidebar.find('img[src="images/ful_o_l.png"]').attr('src', 'images/ful_b_l.png');

			// Store data in localStorage
			custom_blocks.reindexOrderConfig();
		}
	},

	up: function (id) {

		var c_id = $('#' + id);

		// Get index val
		var index = c_id.index('.ext_block');

		// Current position
		if (c_id.closest('#ext_left_sidebar').length > 0) {

			if (index === 0) {
				return false;
			}

		} else {

			var first = $('#ext_left_sidebar').find('.ext_block').length;
			if (index === first) {
				return false;
			}
		}

		// Move to target
		c_id.insertBefore('.ext_block:eq(' + (index - 1) + ')');

		// Store data in localStorage
		custom_blocks.reindexOrderConfig();
	},

	down: function (id) {

		var c_id = $('#' + id);

		// Get index val
		var index = c_id.index('.ext_block');

		// Current position
		if (c_id.closest('#ext_left_sidebar').length > 0) {

			var last = $('#ext_left_sidebar').find('.ext_block').length - 1;

			if (last === index) {
				return false;
			}
		}

		// Move to target
		c_id.insertAfter('.ext_block:eq(' + (index + 1) + ')');

		// Store data in localStorage
		custom_blocks.reindexOrderConfig();
	}
};

var remove_ads = {

	activated: function () {

		// Home facebook widget
		$('#forum-fb-likebox').remove();
		// Top ad bar
		$('nav#menu-family').prev('div').remove();
		// Sidebar ad
		$('section#sidebar-user-favorites').next('div').remove();
		// Bottom ad
		$('div.forum-topics-block').next('div').remove();
	}
};

var wysiwyg_editor = {

	activated: function () {

		var cleditor_iframe = $('.cleditorMain:first iframe');
		var textarea_message = $('textarea[name="message"]:first');
		var buttons = $('#forum-codes');

		// Rearrange buttons
		if (document.location.href.match(/cikkek/)) {

			// Remove username
			$('form[name="newmessage"] b').remove();

			// CLEditor init
			$('textarea[name="message"]').cleditor({width: 660});

		} else {

			//$('#comments-login').remove();

			// CLEditor init
			$('textarea[name="message"]').cleditor();
		}

		buttons.css('position', 'relative');

		// Create smiles container
		$('<div id="ext_smiles"></div>').appendTo('form[name="newmessage"]');

		// Add click event to show or hide smile list
		var smiley = buttons.find('button:eq(0)');

		// Override smiley button action
		smiley.attr('data-codes','ext_smiley');
		smiley.on('click', function() {
			$('#ext_smiles').slideToggle(300);
		});

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

		$('#ext_smiles').html(html);

		// Add click event to the smiles
		$('#ext_smiles').find('img').click(function (e) {

			e.preventDefault();

			var tag = $(this).attr('src').replace(/.*ep\/faces\/(.*?)\..*/ig, "$1");

			var bhtml = '[#' + tag + ']';
			var ihtml = '<img src="/kep/faces/' + tag + '.gif">';

			var tarea = textarea_message.val() + bhtml;
			var imod = cleditor_iframe.contents().find('body').html() + ihtml;

			textarea_message.val(tarea);
			textarea_message.cleditor()[0].focus();
			cleditor_iframe.contents().find('body').html(imod);
			//noinspection JSUnresolvedFunction
			textarea_message.cleditor()[0].focus().updateFrame(cleditor_iframe,true);
		});
	}

};

var message_center = {

	init: function () {

		// HTML code to insert
		var html = '';

		html += '<ul id="ext_mc_tabs">';
		html += '<li class="ext_mc_tabs">Fórumkategóriák</li>';
		html += '<li class="ext_mc_tabs">Saját üzeneteim</li>';
		html += '<li class="ext_mc_tabs">Válaszok</li>';
		html += '</ul>';
		html += '<div id="ext_mc_page">';
		html += '<div class="ext_mc_pages"></div>';
		html += '<div class="ext_mc_pages"><h3>Még nem érkezett válasz egyetlen kommentedre sem.</h3><div class="contents"></div></div>';
		html += '<div class="ext_mc_pages"><h3>Még nincs egy elmentett üzenet sem.</h3></div>';
		html += '</div>';

		// Insert tabs
		$('#forum-chat').after(html);

		var topics = $('.forums-block');

		// Add topik lists to the first page
		$('#ext_mc_page').find('.ext_mc_pages:eq(0)').append(topics);

		// Fix right sidebar top position
		/*$('.cikk-2').closest('tr').children('td:eq(2)').css({ position : 'relative', top : -21 });*/

		// Show the last used tab
		message_center.tab(dataStore['mc_selected_tab']);

		// Set tab selection events
		$('.ext_mc_tabs').click(function () {
			message_center.tab($(this).index());
		});

		// buildOwnCommentsTab
		message_center.buildOwnCommentsTab();

		// Set auto list building in 6 mins
		setInterval(function () {
			message_center.buildOwnCommentsTab();
		}, 360000);

		// buildAnswersTab
		message_center.buildAnswersTab();

		// Set auto list building in 6 mins
		setInterval(function () {
			message_center.buildAnswersTab();
		}, 360000);

		// Start searching ..
		message_center.search();

		// Set auto-search in 5 mins
		setInterval(function () {
			message_center.search();
		}, 300000);

	},

	topic: function () {

		// Set-up post logger
		message_center.log();

		// Start searching ..
		message_center.search();

		// Set auto-search in 5 mins
		setInterval(function () {
			message_center.search();
		}, 300000);

		message_center.jump();
	},

	article: function () {

		// Set-up post logger
		message_center.log();

		// Start searching ..
		message_center.search();

		// Set auto-search in 5 mins
		setInterval(function () {
			message_center.search();
		}, 300000);

		message_center.jump();
	},

	tab: function (n) {

		var mc_pages = $('.ext_mc_pages');

		// Hide all pages
		mc_pages.hide();

		// Show selected page
		mc_pages.eq(n).show();

		// Maintain styles, remove active style 
		$('.ext_mc_tabs').removeClass('active');
		$('.ext_mc_tabs:eq(' + n + ')').addClass('active');

		// Store last selected tag for initial status
		port.postMessage({name: "setMCSelectedTab", message: n});
	},

	jump: function () {

		// Check for message ID in the url
		// Do nothing if not find any comment id
		if (!document.location.href.match(/#komment/)) {
			return false;
		}

		// Fetch comment ID
		var url = document.location.href.split('#komment=');
		var id = url[1];

		// Reset hash
		window.location.hash = '';

		// Find the comment in DOM
		var target = $('#forum-posts-list').find('ul li header a:contains("#' + id + '")').closest('header');

		// Target offsets
		var windowHalf = $(window).height() / 2;
		var targetHalf = $(target).outerHeight() / 2;
		var targetTop = $(target).offset().top;
		var targetOffset = targetTop - (windowHalf - targetHalf);

		// Scroll to target element
		$('body').delay(1000).animate({scrollTop: targetOffset}, 500, function () {
			$(target).css({border: '2px solid red', margin: '10px 0px', 'padding-bottom': 10});
		});
	},

	log: function () {

		var messages, id, message;
		// Check the latest comment for getting the comment ID
		if (getCookie('updateComment')) {

			// Get messages for MC
			messages = JSON.parse(dataStore['mc_messages']);

			// Get the comment ID
			id = getCookie('updateComment');

			// Get message contents
			message = $('#forum-posts-list').find('.post header a:contains("#' + id + '")').closest('header').find('section.body').html();

			// Filter out html-s
			$.each([
				[/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
			], function (index, item) {
				message = message.replace(item[0], item[1]);
			});

			for (var c = 0; c < messages.length; c++) {
				if (messages[c]['comment_id'] === id) {

					// Update message content
					messages[c]['message'] = message;
				}
			}

			// Store new messages object in LocalStorage
			port.postMessage({name: "setMCMessages", message: JSON.stringify(messages)});

			// Store in dataStore var
			dataStore['mc_messages'] = JSON.stringify(messages);

			// Remove marker for getting an ID
			removeCookie('updateComment');
		}

		// Check for update marker
		if (getCookie('getCommentID') === '1') {

			// Get messages for MC
			messages = JSON.parse(dataStore['mc_messages']);


			// Get the comment ID
			id = $('header a:contains("#")').html().match(/\d+/g);

			// Get message contents
			message = $('header').next().find('.maskwindow').html();

			// Filter out html-s
			$.each([
				[/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
			], function (index, item) {
				message = message.replace(item[0], item[1]);
			});

			// Store the ID for the latest message
			messages[0]['comment_id'] = id[0];

			// Update message content
			messages[0]['message'] = message;

			// Store new messages object in LocalStorage
			port.postMessage({name: "setMCMessages", message: JSON.stringify(messages)});

			// Store in dataStore var
			dataStore['mc_messages'] = JSON.stringify(messages);

			// Remove marker for getting an ID
			removeCookie('getCommentID');
		}

		// Catch comment event
		if (!document.location.href.match(/szerkcode/)) {

			$('form[name="newmessage"]').submit(function () {

				var topic_name, topic_id;

				// Article
				if (document.location.href.match(/cikkek/)) {

					// Get topic name
					topic_name = $('.cikk-title:first').html();

					// Get topic ID
					topic_id = $('.std2:last a').attr('href');
					topic_id = topic_id.split('?id=')[1];

					// Topic
				} else {

					// Get topic name
					topic_name = $('select[name="id"] option:selected').text();

					// Get topic ID
					topic_id = $('#topicdata').data('tid');
				}

				// Get comment time
				var time = Math.round(new Date().getTime() / 1000);

				// Get message
				var message = $(this).find('textarea').val();

				// Build the message object
				var tmp = {

					topic_name: topic_name,
					topic_id: topic_id,
					time: time,
					message: message,
					checked: time,
					answers: []
				};

				var messages;

				// If theres no previous messages
				if (dataStore['mc_messages'] === '') {
					messages = [];
					messages.push(tmp);

					// There is other messages
				} else {

					// Get the previous messages from localStorage
					messages = JSON.parse(dataStore['mc_messages']);

					// Unshift the new message
					messages.unshift(tmp);

					// Check for max entries
					if (messages.length > 10) {
						messages.splice(9);
					}
				}

				// Store in localStorage
				port.postMessage({name: "setMCMessages", message: JSON.stringify(messages)});

				// Set a marker for gettni the comment ID
				setCookie('getCommentID', '1', 1);
			});
		} else {

			$('form[name="newmessage"]').submit(function () {

				// Get comment ID
				var comment_id = parseInt($('.std1:first').find('b').html().match(/\d+/g));

				// Set marker to be update this comment
				setCookie('updateComment', comment_id, 1);
			});

		}
	},

	search: function () {

		// Check if theres any previous posts
		if (dataStore['mc_messages'] === '') {
			return false;
		}

		// Get the latest post
		var messages = JSON.parse(dataStore['mc_messages']);

		// Var to count new messages
		var newmessages = 0;

		// Iterate over the posts
		for (var key = 0; key < messages.length; key++) {

			// Get current timestamp
			var time = Math.round(new Date().getTime() / 1000);

			// Check last searched state
			if (time < messages[key].checked + 60 * 10) {
				continue;
			}

			// Make the requests
			newmessages += message_center.doAjax(messages, key);
		}
	},

	doAjax: function (messages, key) {

		// Var to count new messages
		var counter = 0;

		$.ajax({

			url: 'utolso80.php?id=' + messages[key]['topic_id'],
			mimeType: 'text/html;charset=iso-8859-2',
			async: false,
			dataType: 'html',

			success: function (data) {

				// Parse html response
				var tmp = $(data);

				var answers = [];
				var time;

				// Search posts that is an answer to us
				var TmpAnswers = $(tmp.find('.header a:contains("#' + messages[key]['comment_id'] + '")').closest('center').get().reverse());

				// Iterate over the answers
				if (TmpAnswers.length === 0) {

					// Get current time
					time = Math.round(new Date().getTime() / 1000);

					// Set new checked date
					messages[key]['checked'] = time;

					// Store in localStorage
					port.postMessage({name: "setMCMessages", message: JSON.stringify(messages)});

					// Store in dataStore
					dataStore['mc_messages'] = JSON.stringify(messages);

					return false;

				}

				for (var c = 0; c < TmpAnswers.length; c++) {

					var nick = ($(TmpAnswers[c]).find(".topichead table tr:eq(0) td:eq(0) a img").length === 1) ? $(TmpAnswers[c]).find('.topichead table tr:eq(0) td:eq(0) a img').attr("alt") : $(TmpAnswers[c]).find(".topichead table tr:eq(0) td:eq(0) a")[0];
					nick = nick.replace(/ - VIP/, "");

					var message = $(TmpAnswers[c]).find('.maskwindow').html();
					// For "security" reasons, filter message
					message = safeResponse.cleanDomHtml(message);

					var id = $(TmpAnswers[c]).find('.topichead a:last').html().match(/\d+/g)[0];

					var AD = {
						id: id,
						author: nick,
						message: message
					};

					answers.push(AD);
				}

				// Count new messages
				if (messages[key]['answers'].length !== TmpAnswers.length) {
					counter = 1;
				}

				// Get current time
				time = Math.round(new Date().getTime() / 1000);

				// Set new checked date
				messages[key]['checked'] = time;

				// Set the answers
				messages[key]['answers'] = answers;

				// Store in localStorage
				port.postMessage({name: "setMCMessages", message: JSON.stringify(messages)});

				// Store in dataStore
				dataStore['mc_messages'] = JSON.stringify(messages);
			}
		});

		return counter;
	},

	buildOwnCommentsTab: function () {

		// Check if theres any previous posts
		if (dataStore['mc_messages'] === '') {
			return false;
		}

		// Get the previous messages form LocalStorage
		var messages = JSON.parse(dataStore['mc_messages']);

		if (messages.length > 0) {
			$('.ext_mc_pages:eq(1)').html('');
		}

		// Iterate over the messages
		for (var c = 0; c < messages.length; c++) {

			// Get the post date and time
			var time = date('Y. m. d. -  H:i', messages[c]['time']);

			// Get the today's date
			var today = date('Y. m. d.', Math.round(new Date().getTime() / 1000));

			// Get yesteday's date
			var yesterday = Math.round(new Date().getTime() / 1000) - 60 * 60 * 24;
			yesterday = date('Y. m. d.', yesterday);

			// Convert today and yesterday strings
			$.each([
				[today, "ma"],
				[yesterday, "tegnap"]

			], function (index, item) {
				time = time.replace(item[0], item[1]);
			});

			// Get the message
			var msg = messages[c]['message'];

			// Filter out BB tags and add line breaks
			$.each([
				[/[\r|\n]/g, "<br>"],
				[/\[.*?]([\s\S]*?)\[\/.*?]/g, "$1"]

			], function (index, item) {
				msg = msg.replace(item[0], item[1]);
			});

			var html = '';

			html += '<div class="ext_mc_messages">';
			html += '<p><a href="https://sg.hu/forum/tema/' + messages[c]['topic_id'] + '">' + messages[c]['topic_name'] + '</a></p>';
			html += '<span>' + time + '</span>';
			html += '<div>' + msg + '</div>';
			html += '</div>';

			$(html).appendTo('.ext_mc_pages:eq(1)');
		}
	},

	buildAnswersTab: function () {

		// Check if theres any previous posts
		if (dataStore['mc_messages'] === '') {
			return false;
		}

		// Get the previous messages form LocalStorage
		var messages = JSON.parse(dataStore['mc_messages']);

		// Empty the container first for re-init
		$('.ext_mc_pages:eq(2) div.contents').html('');


		// Iterate over the messages
		for (var c = 0; c < messages.length; c++) {

			// Html to insert
			var html = '';

			// Continue when no answers
			if (messages[c]['answers'].length === 0) {
				continue;
			}

			// Get the post date and time
			var time = date('Y. m. d. -  H:i', messages[c]['time']);

			// Get the today's date
			var today = date('Y. m. d.', Math.round(new Date().getTime() / 1000));

			// Get yesteday's date
			var yesterday = Math.round(new Date().getTime() / 1000) - 60 * 60 * 24;
			yesterday = date('Y. m. d.', yesterday);

			// Convert today and yesterday strings
			$.each([
				[today, "ma"],
				[yesterday, "tegnap"]

			], function (index, item) {
				time = time.replace(item[0], item[1]);
			});

			// Get the message
			var msg = messages[c]['message'];

			// Filter out BB tags and add line breaks
			$.each([
				[/[\r|\n]/g, "<br>"],
				[/\[.*?]([\s\S]*?)\[\/.*?]/g, "$1"]

			], function (index, item) {
				msg = msg.replace(item[0], item[1]);
			});

			// Own comment
			html += '<div class="ext_mc_messages">';
			html += '<p><a href="https://sg.hu/forum/tema/' + messages[c]['topic_id'] + '">' + messages[c]['topic_name'] + '</a></p>';
			html += '<span>' + time + '</span>';
			html += '<div>' + msg + '</div>';
			html += '</div>';

			// Iterate over the answers
			for (var a = 0; a < messages[c]['answers'].length; a++) {

				html += '<div class="ext_mc_messages ident">';
				html += '<p>';
				html += '' + messages[c]['answers'][a]['author'] + '';
				html += ' - <a href="https://sg.hu/forum/tema/' + messages[c]['topic_id'] + '#komment=' + messages[c]['answers'][a]['id'] + '" class="ext_mc_jump_to">ugrás a hozzászólásra</a>';
				html += '</p>';
				html += '<div>' + messages[c]['answers'][a]['message'] + '</div>';
				html += '</div>';
			}

			// Insert html
			$(html).appendTo('.ext_mc_pages:eq(2) div.contents');

			if (html !== '') {
				$('.ext_mc_pages:eq(2)').find('h3').remove();
			}
		}
	}

};

function setCookie(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = encodeURI(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x === c_name) {
			return decodeURI(y);
		}
	}
}

function removeCookie(name, path, domain) {
	if (getCookie(name)) document.cookie = name + "=" +
		( ( path ) ? ";path=" + path : "") +
		( ( domain ) ? ";domain=" + domain : "" ) +
		";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}

var topic_whitelist = {

	execute: function (ele) {

		// Get topic ID
		var id = $('nav#breadcrumb select option:selected').val();

		// Add topic to whitelist
		if ($(ele).html() === '+') {

			// Change the status icon
			$(ele).html('-');

			// Change status title
			$(ele).attr('title', 'Téma eltávolítása a fehérlistából');

			// Add to config
			port.postMessage({name: "addTopicToWhitelist", message: id});

			// Remove topic from whitelist
		} else {

			// Change the status icon
			$(ele).html('+');

			// Change status title
			$(ele).attr('title', 'Téma hozzáadása a fehérlistához');

			// Remove from config
			port.postMessage({name: "removeTopicFromWhitelist", message: id});
		}
	}
};

var textarea_auto_resize = {

	height: 122,

	init: function () {

		var textarea = $('textarea[name=message]');

		// Create the text holder element
		$('<div id="ext_textheight"></div>').prependTo('body');

		// Create the keyup event
		textarea.on('input', function () {
			textarea_auto_resize.setHeight(this);
		});

		textarea_auto_resize.height = textarea.height();
	},

	setHeight: function (ele) {

		// Get element value
		var val = $(ele).val();
		var ext_height = $('#ext_textheight');

		// Escape the value
		val = val.replace(/</gi, '&lt;');
		val = val.replace(/>/gi, '&gt');
		//val = val.replace(/\ /gi, '&nbsp;');
		val = val.replace(/\n/gi, '<br>');

		// Set the textholder element width
		ext_height.css('width', $(ele).width());

		// Set the text holder element's HTML
		ext_height.html(val);

		// Get the text holder element's height
		var height = ext_height.height() + 12;

		// Check for expand
		if (height > $(ele).height()) {
			$(ele).height($(ele).height() + 50);
		}

		// Check for shrink
		if ($(ele).height() > textarea_auto_resize.height && height < $(ele).height()) {

			var newHeight = height < textarea_auto_resize.height ? textarea_auto_resize.height : height;

			$(ele).height(newHeight);
		}
	}
};

var disable_point_system = {

	activated: function () {
		$('#forum-posts-list').find('span.forum-post-rate-place').hide();
	}
};

var profiles = {

	init: function () {

		// Get the profiles object
		var profiles = JSON.parse(dataStore['profiles']);

		// Check empty
		if (!profiles.length) {
			return false;
		}

		// Iterate over the comments
		$('#forum-posts-list').find('ul li header:not(.checked)').each(function () {
			var nick;

			// Create the wrapper if not any
			if (!$(this).next().is('.wrapper')) {

				// Create the wrapper
				var wrapper = $('<div class="wrapper"></div>').insertAfter(this).css('position', 'relative');

				// Place in other elements
				//noinspection JSCheckFunctionSignatures
				$(this).parent().find('section.body, footer').appendTo(wrapper);
			}

			// Get nickname
			if (document.location.href.match(/cikkek/)) {

				nick = $(this).find('a:first').html();

			} else {

				nick = ($(this).find("a img").length === 1) ? $(this).find("a img").attr("alt") : $(this).find("a#name").text();
				nick = nick.replace(/ - VIP/, "");
			}

			// Remove old outlines and titles
			$(this).next().find('.outline').remove();
			$(this).find('.titles').remove();

			// Set the background to default and remove paddings
			//$(this).next().find('section.body, footer').css('background-color', '#F0F0F0'); // custom topik fix
			$(this).next().find('section.body, footer').css('padding', 3);

			// Iterate over the profile settings
			// Search for nickname match
			for (var c = 0; c < profiles.length; c++) {
				for (var u = 0; u < profiles[c]['users'].length; u++) {
					if (jQuery.trim(profiles[c]['users'][u]) === nick) {

						// WE GOT A MATCH

						// Title
						//noinspection JSCheckFunctionSignatures
						var placeholder = $('<span class="titles">' + profiles[c]['title'] + '</span>').appendTo( $(this).find('span.icons') );
						placeholder.css('padding-left', 10);

						// Calc outline width 
						var width = (1 + $(this).parent().find('.wrapper:first .outline').length) * 8 - 8;

						// Border
						//noinspection JSCheckFunctionSignatures
						var outline = $('<div class="outline"></div>').insertBefore( $(this).parent().find('section.body, footer') );
						outline.css({
							width: 6,
							height: '100%',
							position: 'absolute',
							left: width,
							top: 0,
							backgroundColor: '#' + profiles[c]['color'][0]
						});

						// Background
						if (profiles[c]['background']) {
							$(this).parent().find('section.body, footer').css('background-color', '#' + profiles[c]['color'][1]);
						}

						// Fix msg-text
						$(this).parent().find('section.body, footer').css('padding-left', (width + 3 + 8));
					}
				}
			}

			// Add checked marker
			$(this).addClass('checked');
		});
	}
};

var add_to_list = {

	colors: {

		'1': '7fadd4', '2': '90abc3', '3': '597995', '4': '657889', '5': '658969',
		'6': '898665', '7': '897665', '8': '896586', '9': '986856', '10': '985690',
		'11': '565698', '12': '56988f', '13': '689856', '14': '979155', '15': '977455',
		'18': '9dc6e2', '19': '9ca7e2', '20': 'c99ce2', '21': 'e29cdb', '22': 'e29da5',
		'24': 'c0c0c0', '25': 'a0a0a0', '26': '808080', '27': '555555'
	},

	init: function () {

		// Create dropdowns
		$('#forum-posts-list').find('ul li header:not(.ext_add_to_list_topichead) a:contains("#")').each(function () {

			// Insert separator
			var separator = $('<span class="separator pull-right"></span>').insertBefore(this);

			// Insert dropdow placeholder
			//noinspection JSCheckFunctionSignatures
			var dropdown = $('<div class="ext_dropdown pull-right"><span>&#9660;</span></div>').insertBefore(separator);

			// Insert dropdown list
			//noinspection JSCheckFunctionSignatures
			var list = $('<ul></ul>').appendTo(dropdown).addClass('ext_addtolist_list');

			// Set dropdown background color
			var color_id = $(this).closest('#forum-posts-list ul li').css('background-image').match(/\d+/g);

			if (color_id) {
				list.css('background-color', '#' + add_to_list.colors[color_id]);
			} else {
				list.css('background-color', '#ccc');
			}

			// Set relative position to the container
			$(this).closest('#forum-posts-list ul li header').css('position', 'relative').addClass('ext_add_to_list_topichead');

		});

		// Create dropdown event
		$('.ext_dropdown').off().on('click', function () {

			if ($(this).find('ul').css('display') === 'none') {
				$(this).find('ul').css('top', $(this).closest('#forum-posts-list ul li header').height()).slideDown();
			} else {
				$(this).find('ul').slideUp();
			}
		});

		$('.ext_addtolist_list').find('*').remove();

		// Build list
		add_to_list.buildList();

		// Create events for blocklist
		$('.ext_addtoblocklist').off().on('click', function () {
			blocklist.block(this);
		});

		// Create events for lists
		$('.ext_addtolist').off().on('click', function () {
			add_to_list.addToList($(this).attr('class').match(/\d+/g), this);
		});
	},


	buildList: function () {

		// Add the title
		$('<li><h3>Hozzáadás listához</h3></li>').appendTo('.ext_addtolist_list');

		// Insert separator
		$('<li></li>').appendTo('.ext_addtolist_list');

		// Add blocklist option
		$('<li class="ident ext_addtoblocklist">Tiltólista</li>').appendTo('.ext_addtolist_list');

		if (dataStore['profiles'] === '') {
			return;
		}

		// Get the profile groups
		var profiles = JSON.parse(dataStore['profiles']);

		// Iterate over the groups, add each one to the list
		for (var c = 0; c < profiles.length; c++) {
			$('<li><hr></li>').appendTo('.ext_addtolist_list');
			$('<li class="ident ext_addtolist profile_' + c + '" style="color: #' + profiles[c]['color'][0] + ';">' + profiles[c]['title'] + '</li>').appendTo('.ext_addtolist_list');
		}

	},


	addToList: function (group, ele) {

		// Get profiles
		var list = JSON.parse(dataStore['profiles']);
		var nick;

		// Get user's nick
		var anchor = $(ele).closest('#forum-posts-list ul li header').find('a[href*="felhasznalo"]');

		if (anchor.children('img').length > 0) {
			nick = anchor.children('img').attr('title').replace(" - VIP", "");

		} else {
			nick = anchor.html().replace(" - VIP", "");
		}

		// Check user
		if (list[group]['users'].indexOf(nick) === -1) {
			list[group]['users'].push(nick);
		} else {
			list[group]['users'].splice(list[group]['users'].indexOf(nick), 1);
		}

		// Stringify the new profiles list
		var data = JSON.stringify(list);

		// Save in dataStore
		dataStore['profiles'] = data;

		// Save in localStorage
		port.postMessage({name: "setSetting", key: 'profiles', val: data});


		// Remove checked class for update
		$("#forum-posts-list").find("ul li").each(function () {
			var nick_2;

			if (document.location.href.match(/cikkek/)) {

				nick_2 = $(this).find('a:first').html();

			} else {
				/* BUG avatar nélküli felhasználóknál nem működik.     $(this).find("header a")[0]  undefined */
				nick_2 = ($(this).find("header a img").length === 1) ? $(this).find("header a img").attr("alt") : $(this).find("header a")[0];
				nick_2 = nick_2.replace(/ - VIP/, "");
			}

			if (nick === nick_2) {
				$(this).removeClass('checked');
			}
		});

		// Update content GUI
		profiles.init();
	}
};

var columnify_comments = {

	activated: function () {

		$('#forum-posts-list').find('.post:not(.columnify)').each(function () {

			// Get the message element
			var target = $(this).find('section.body');

			// if no target
			if (target.html() === undefined)
				return;

			// Add multi column when the text is larger than 200px
			if (target.html().length > 800) {
				target.css({'-webkit-column-width': 296, '-webkit-column-gap': 20, 'text-align': 'justify'});
			}

			// Add 'columnify' class
			$(this).addClass('columnify');
		});
	},

	disabled: function () {

		$('#forum-posts-list').find('.columnify').each(function () {
			$(this).next().find('section.body').css({'-webkit-column-width': 'auto', '-webkit-column-gap': 0});
		});
	}

};

var quick_user_info = {

	activated: function () {

		$('#forum-posts-list').find('.post').each(function () {

			//Do not add the mouseenter function again if the element already has it
			if (!$(this).data('events')) {

				$($(this)).mouseenter(function () {
					if ($(this).not('.quick_user_info')) {
						//Place info image
						$(this).addClass('quick_user_info').find('span.icons').after('<span class=""><img src="' + chrome.extension.getURL('/img/content/info.png') + '" class="ext_quick_user_info_btn"></span>');
					}
					$(this).append('<div class=\"infobox\"></div>');

					//Add EventListener
					$('img.ext_quick_user_info_btn').click(function () {
						var infobox = $('.infobox');

						//Get user profile URL
						var url = $(this).closest('header').find('a[href^="/felhasznalo"]').attr('href');

						//Fix for vip, non vip topichead height
						var th_height = $(this).closest('header').css('height').replace('px', '');

						//Get topichead pos from the top of the page
						var fromTop = $(this).closest('header').offset().top - 122;

						//If "highlight_comments_for_me" is on we need to change the fromTop to the comment position
						if ($(this).closest('li').has('img.ext_comments_for_me_indicator').length ? true : false) {
							//Correct according a default padding on the messages
							fromTop = $(this).closest('header').css('padding-top').replace('px', '');
						}
						var fullHeight = parseInt(fromTop, 10) + parseInt(th_height, 10);

						//Show infobox -121
						infobox.css({'font-size': '10px', 'display': 'block', 'top': fullHeight});

						//Show user information in infobox
						infobox.load(url + ' table.data-table');
					});

				}).mouseleave(function () {

					//Remove info image and infobox on mouseleave
					$(this).find('.ext_quick_user_info_btn').parent().remove();
					$(this).find('.infobox').remove();
				});
			}
		});
	}
};

var quick_insertion = {

	activated: function () {

		var ta;
		var ta2;
		/*		if(dataStore['wysiwyg_editor'] === 'true') {
		 ta = $('.cleditorMain:first iframe').contents().find('body'); //textarea*/
		ta2 = $('.cleditorMain:first textarea[name="message"]');
		/*}
		 else {*/
		ta = $('form[name="newmessage"] textarea');
		/*}*/

		// Paste event on WYSIWYG view and source view
		$(ta).add(ta2).on('paste', function (e) {

			//noinspection JSUnresolvedVariable
			var data = e.originalEvent.clipboardData.getData('Text');
			if (data.length > 10) {

				var urlpattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
				var imgpattern = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;

				var bhtml;
				//var ihtml;

				if (imgpattern.test(data)) {
					e.preventDefault();
					bhtml = '[img]' + data + '[/img]';
					//ihtml = '<img src="' + data + '">';
				}
				else if (urlpattern.test(data)) {
					e.preventDefault();

					var a = document.createElement('a'); // Create a dummy <a> element
					a.href = data;                       // Assign link, let the browser parse it
					var url_pathname = a.pathname.substring(1, data.length);
					if (url_pathname.length === 0) {
						url_pathname = data;
					}
					bhtml = '[url=' + data + ']' + url_pathname + '[/url]';
					//ihtml = '<a href="' + data + '">' + url_pathname + '</a>';
				}

				if (bhtml !== undefined) {
					var ta = $('textarea[name="message"]:first');
					var tarea = ta.val() + bhtml;
					//var imod = $('.cleditorMain:first iframe').contents().find('body').html() + ihtml;

					// Otherwise when wysiwyg editor will appear even if it's disabled
					/*					if(dataStore['wysiwyg_editor'] === 'true') {
					 $('textarea[name="message"]:first').val(tarea);
					 $('textarea[name="message"]:first').cleditor()[0].focus();
					 $('.cleditorMain:first iframe').contents().find('body').html(imod);
					 $('textarea[name="message"]:first').cleditor()[0].focus();

					 } else {*/
					ta.val(tarea);
					/*}*/
				}

			} else {
				return true;
			}
		});
	}

};

var update_settings = {

	activated: function () {
		var msg = $("input[name='msglimit']").val();
		port.postMessage({name: "setSetting", key: 'msg_per_page', val: msg});

		/*dataStore['msg_per_page'] = $("input[name='msglimit']").val();*/
	}
};

var inline_image_viewer = {

	activated: function () {
		// Get the proper domnodes
		var comment_links = $('#forum-posts-list').find('ul .post .body .bb-link');
		var imgpattern = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;

		// Iterate over them
		comment_links.each(function () {
			var url = $(this).attr('href');
			//noinspection JSCheckFunctionSignatures
			if (imgpattern.test(url)) {
				$(this).after('<div class="ext-inline-view closed" data-url="' + url + '" style="display:inline;"><span> &#9654; </span></div>');
			}

		});

		$('.ext-inline-view').on('click', function () {
			//inline_image_viewer.append();
			if ($(this).hasClass('closed')) {
				$(this).find('span').html('&#9660;');
				$(this).after('<img class="inline-image" src="' + $(this).data('url') + '" style="display:block;">');
				$(this).removeClass('closed');
			}
			else {
				$(this).find('span').html(' &#9654; ');
				$(this).parent().find('.inline-image').remove();
				$(this).addClass('closed');
			}
		});
	}
};

// https://github.com/operatester/safeResponse/blob/1.1/safeResponse.js
var safeResponse = {

	validAttrs : [ "class", "id", "href", "style", "data-info", "data-post-info", "rel", "target", "src", "alt", "title",
		"datetime", "direction", "data-id", "border", "height", "width", "onload", "data-pagespeed-url-hash" ],

	cleanDomString: function (html) {
		return safeResponse.__cleanDomString(html);
	},

	cleanDomHtml: function (html) {
		return safeResponse.__cleanDomHtml(html);
	},

	__removeInvalidAttributes: function(target) {
		var attrs = target.attributes, currentAttr;

		for (var i = attrs.length - 1; i >= 0; i--) {
			currentAttr = attrs[i].name;

			if (attrs[i].specified && safeResponse.validAttrs.indexOf(currentAttr) === -1) {
				target.removeAttribute(currentAttr);
			}

			if (
				currentAttr === "href" &&
				target.getAttribute("href").length > 1 &&
				/^((javascript[:])|#(?!reply))/gi.test(target.getAttribute("href"))
			) {
				target.parentNode.removeChild(target);
			}
		}
	},

	__cleanDomString: function (data) {
		var parser = new DOMParser;
		var tmpDom = parser.parseFromString(data, "text/html").body;

		return safeResponse.clean(tmpDom);
	},

	__cleanDomHtml: function (data) {
		var parser = new DOMParser;
		var tmpDom = parser.parseFromString(data.outerHTML, "text/html").body;

		return safeResponse.clean(tmpDom);
	},

	clean: function (tmpDom) {
		var list, current;

		list = tmpDom.querySelectorAll("script");

		for (var i = list.length - 1; i >= 0; i--) {
			current = list[i];
			current.parentNode.removeChild(current);
		}

		list = tmpDom.getElementsByTagName("*");

		for (i = list.length - 1; i >= 0; i--) {
			safeResponse.__removeInvalidAttributes(list[i]);
		}
		return tmpDom.innerHTML;
	}
};

function extInit() {

	if (document.location.href === 'https://sg.hu/felhasznalo/beallitasok') {
		update_settings.activated();
	}

	// SG index.php
	if (document.location.href === 'https://sg.hu/' || document.location.href.match(/index.php/)) {

		// Settings
		cp.init(3);

		// Articles
	} else if (document.location.href.match(/cikkek/)) {
		// Settings
		cp.init(2);

		// setPredefinedVars
		setPredefinedVars();

		// Message Center
		if (dataStore['message_center'] === 'true' && isLoggedIn()) {
			message_center.article();
		}

		// Threaded_comments
		if (dataStore['threaded_comments'] === 'true') {
			// only fire if page has loaded
			$(function () {
					threaded_comments.activated();
				}
			);
		}

		// Set-up block buttons
		add_to_list.init();

		// Block users/messages
		if (dataStore['block_list'] !== '') {
			blocklist.hidemessages();
		}

		// Load next page when scrolling down
		if (dataStore['autoload_next_page'] === 'true') {
			autoload_next_page.activated();
		}

		// Show navigation buttons
		if (dataStore['show_navigation_buttons'] === 'true') {
			show_navigation_buttons.activated();
		}

		// Animated replyto
		replyTo();

		// Overlay reply-to
		if (dataStore['overlay_reply_to'] === 'true') {
			overlay_reply_to.activated();
		}

		// highlight_comments_for_me
		if (dataStore['highlight_comments_for_me'] === 'true' && isLoggedIn()) {
			highlight_comments_for_me.activated();
		}

		// WYSIWYG Editor
		if(dataStore['wysiwyg_editor'] === 'true') {
			wysiwyg_editor.activated();
		}

		if (dataStore['disable_point_system'] === 'true') {
			disable_point_system.activated();
		}

		// Auto resizing textarea
		textarea_auto_resize.init();

		if (dataStore['profiles'] !== '') {
			profiles.init();
		}

		if (dataStore['columnify_comments'] === 'true') {
			columnify_comments.activated();
		}

		//Pasted text will be a hyperlink, picture, video automatically
		if(dataStore['wysiwyg_editor'] === 'true' && dataStore['quick_insertion'] === 'true') {
			quick_insertion.activated();
		}

		// image, video urls in msg box can be previewed inline
		if (dataStore['inline_image_viewer'] === 'true') {
			inline_image_viewer.activated();
		}
		// FORUM
	} else if (document.location.href.match(/forum\/$/)) {
		// Settings
		cp.init(1);

		// setPredefinedVars
		setPredefinedVars();

		// Remove chat window
		if (dataStore['chat_hide'] === 'true') {
			chat_hide.activated();
		}

		// Custom blocks
		if (dataStore['custom_blocks'] === 'true') {
			custom_blocks.activated();
		}

		// Jump the last unreaded message
		if (dataStore['jump_unreaded_messages'] === 'true' && isLoggedIn()) {
			jump_unreaded_messages.activated();
		}

		// Faves: show only with unreaded messages
		if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
			fav_show_only_unreaded.init();
			fav_show_only_unreaded.activated();
		}

		// Faves: short comment marker
		if (dataStore['short_comment_marker'] === 'true' && isLoggedIn()) {
			short_comment_marker.activated();
		}

		// Custom list styles
		if (dataStore['highlight_forum_categories'] === 'true') {
			highlight_forum_categories.activated();
		}

		// Refresh faves
		if (isLoggedIn()) {
			update_fave_list.activated();
		}

		// Make readed all faves
		if (isLoggedIn()) {
			make_read_all_faves.activated();
		}

		// Message center
		if (dataStore['message_center'] === 'true' && isLoggedIn()) {
			message_center.init();
		}

		//Night mode
		if (dataStore['show_navigation_buttons_night'] === 'true' && dataStore['navigation_button_night_state'] === 'true') {
			lights.forum_switchOn();
		}
	}
	// TOPIK
	else if (document.location.href.match(/forum\/tema/)) {
		// Settings
		cp.init(2);

		// Get topic ID for whitelist check
		var id = $('nav#breadcrumb select option:selected').val();

		// Determining current status
		var whitelist = dataStore['topic_whitelist'].split(',');

		if (whitelist.indexOf(id) === -1) {

			// setPredefinedVars
			setPredefinedVars();

			// Monitor the new comments
			if (dataStore['fetch_new_comments'] === 'true') {
				fetch_new_comments_in_topic.init();
			}

			// Message Center
			if (dataStore['message_center'] === 'true' && isLoggedIn()) {
				message_center.topic();
			}

			//gradual_comments
			if (dataStore['threaded_comments'] === 'true') {
				// only fire if page has loaded
				$(function () {
						threaded_comments.activated();
					}
				);
			}

			// Jump the last unreaded message
			if (dataStore['jump_unreaded_messages'] && isLoggedIn()) {
				jump_unreaded_messages.topic();
			}

			// Set-up block buttons
			add_to_list.init();

			// Block users/messages
			if (dataStore['block_list'] !== '') {
				blocklist.hidemessages();
			}

			// Load next page when scrolling down
			if (dataStore['autoload_next_page'] === 'true') {
				autoload_next_page.activated();
			}

			// Scroll to page top button
			if (dataStore['show_navigation_buttons'] === 'true') {
				show_navigation_buttons.activated();
			}


			// Animated replyto
			replyTo();

			// Overlay reply-to
			if (dataStore['overlay_reply_to'] === 'true') {
				overlay_reply_to.activated();
			}

			// highlight_comments_for_me
			if (dataStore['highlight_comments_for_me'] === 'true' && isLoggedIn()) {
				highlight_comments_for_me.activated();
			}

			// WYSIWYG Editor
			if(dataStore['wysiwyg_editor'] === 'true') {
				wysiwyg_editor.activated();
			}

			// Auto resizing textarea
			textarea_auto_resize.init();

			if (dataStore['profiles'] !== '') {
				profiles.init();
			}

			if (dataStore['columnify_comments'] === 'true') {
				columnify_comments.activated();
			}

			//Quick user info button
			if (dataStore['quick_user_info'] === 'true') {
				quick_user_info.activated();
			}

			//Pasted text will be a hyperlink, picture, video automatically
			if (dataStore['quick_insertion'] === 'true') {
				quick_insertion.activated();
			}

			// image, video urls in msg box can be previewed inline
			if (dataStore['inline_image_viewer'] === 'true') {
				inline_image_viewer.activated();
			}

			// Topic if whitelisted, show the navigation
			// buttons for removal
		} else {
			show_navigation_buttons.activated();
		}
	}

	// GLOBAL SCRIPTS
	// remove adverts
	if (dataStore['remove_ads'] === 'true') {
		remove_ads.activated();
	}
}

// Filter out iframes
// Request settings object
if (window.top === window) {
	port.postMessage({name: "getSettings"});
}

//noinspection JSCheckFunctionSignatures
port.onMessage.addListener(function (event) {

	if (event.name === 'setSettings') {

		// Save localStorage data
		dataStore = event.message;

		// Add domready event
		$(document).ready(function () {
			extInit();
		});

	} else if (event.name === 'updateDataStore') {

		// Update dataStore with the new data
		dataStore = event.message;
	}
});