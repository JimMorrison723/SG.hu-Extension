export function logInit() {

	// Clear event
	$('.settings_page.debugger button').click(function () {
		logClear();
	});
}

export function logAdd(message, origin) {

	// Get current timestamp
	var time = Math.round(new Date().getTime() / 1000);
	var messages = [];

	// Parse messages
	if (database['debugger_messages'] !== '') {
		messages = JSON.parse(database['debugger_messages']);
	}

	var month = date('M', time);

	// Convert mounts names
	$.each([
		['Jan', 'január'],
		['Feb', 'február'],
		['Mar', 'március'],
		['Apr', 'április'],
		['May', 'május'],
		['Jun', 'június'],
		['Jul', 'július'],
		['Aug', 'augusztus'],
		['Sep', 'szeptember'],
		['Oct', 'október'],
		['Nov', 'november'],
		['Dec', 'december']

	], function (index, item) {
		month = month.replace(item[0], item[1]);
	});

	// Append timestamp
	message = month + date('d. H:i - ', time) + message;

	// Append origin
	if (typeof origin !== "undefined") {
		message = message + ' | Origin: ' + origin;
	}

	// Add new messages
	messages.push(message);

	if (messages.length > 100) {
		messages.splice(0, 1);
	}

	// Add to database
	database['debugger_messages'] = JSON.stringify(messages);

	// Store new settings
	port.postMessage({name: "setSetting", key: 'debugger_messages', val: JSON.stringify(messages)});

	// Update the GUI
	var textarea = $('.settings_page.debugger textarea').html();
	textarea.html(textarea + message + "\r\n");
}

export function logClear() {

	// Clear in localStorage
	port.postMessage({name: "setSetting", key: 'debugger_messages', val: ''});

	// Clear in database
	database['debugger_messages'] = '';

	// Clear the debugger window
	$('.settings_page.debugger textarea').html('');
}