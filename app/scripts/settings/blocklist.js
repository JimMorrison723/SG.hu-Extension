import { database } from "../utils/options";

export function blocklistInit() {

	// Create user list
	blocklistList();

	// Create remove events
	$('#ext_blocklist').on('click', 'a', function (e) {
		e.preventDefault();
		blocklistRemove(this);
	});
}

export function blocklistList() {
	// If theres is no entry in database or If the list is empty
	if (typeof database['block_list'] === "undefined" || !database['block_list']) {
		return false;
	}

	var blocklist = $('#ext_blocklist');
	// Everything is OK, remove the default message
	blocklist.html('');

	// Fetch the userlist into an array
	var users = database['block_list'].split(',').sort();

	// Iterate over, add users to the list
	for (var c = 0; c < users.length; c++) {
		blocklist.append('<li><span>' + users[c] + '</span> <a href="#">töröl</a></li>');
	}
}

export function blocklistRemove(el) {

	// Get username
	var user = $(el).prev().html();

	// Remove user from the list
	$(el).closest('li').remove();

	// Remove user from preferences
	port.postMessage({name: "removeUserFromBlocklist", message: user});

	// Add default message to the list if it is now empty
	if ($('#ext_blocklist').find('li').length === 0) {
		$('<li id="ext_empty_blocklist">Jelenleg üres a tiltólistád</li>').appendTo('#ext_blocklist');
	}

	// Restore user comments
	blocklist.unblock(user);
}