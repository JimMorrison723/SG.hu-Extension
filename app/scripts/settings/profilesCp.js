import { database } from "../utils/options";

export function profilesCpInit() {

	// Add new profile group
	$('.settings_page a.new_profile').on('click', function (e) {
		e.preventDefault();
		profilesCpAddGroup();
	});

	// Color select
	$('.settings_page .profiles').on('click', 'li ul li', function () {
		profilesCpChangeColor(this);
	});

	// Remove a group
	$('.settings_page ul.profiles').on('click', 'p.remove', function () {
		profilesCpRemoveGroup(this);
	});

	// Save the settings
	$('.settings_page .profile_save').on('click', function (e) {

		// Prevent browsers default submission
		e.preventDefault();

		// Save the settings
		profilesCpSave();
	});

	// Rebuild profiles
	profilesCpRebuildProfiles();
}

function profilesCpRebuildProfiles() {

	if (database['profiles'] === '') {
		return false;
	}

	// Empty the list
	$('.settings_page .profiles > li:not(.sample)').remove();

	// TODO
	//var profiles = JSON.parse(database['profiles']);
	/*
	 for (var c = 0; c < profiles.length; c++) {

	 // Get the clone elementent
	 var clone = $('.settings_page .profiles li.sample').clone();

	 // Get the target element
	 var target = $('.settings_page .profiles');

	 // Append the new group
	 var content = $(clone).appendTo(target).removeClass('sample');

	 // Re-set settings
	 content.find('.color').val(profiles[c]['color']);
	 content.find('span.color').css('background-color', '#' + profiles[c]['color'][0]);
	 content.find('.title').val(profiles[c]['title']);
	 content.find('.users').val(profiles[c]['users']);

	 // Re-set checkboxes
	 if (profiles[c]['background']) {
	 content.find('.background').attr('checked', true);
	 }
	 }*/
}

function profilesCpAddGroup() {

	// Get the clone elementent
	var clone = $('.settings_page .profiles li.sample').clone();

	// Get the target element
	var target = $('.settings_page .profiles');

	// Append the new group
	$(clone).appendTo(target).removeClass('sample');
}

function profilesCpRemoveGroup(ele) {

	if (confirm('Biztos törlöd ezt a csoportot?')) {

		// Remove the group from DOM
		$(ele).closest('li').remove();
	}
}

function profilesCpChangeColor(ele) {

	// Get selected color
	var color = $(ele).find('span').html().split(',');

	// Set the color indicator
	$(ele).parent().parent().find('span:first').css('background-color', '#' + color[0]);

	// Set the color input
	$(ele).parent().parent().find('input.color').val(color.join(','));
}

function profilesCpSave() {

	// Var to store data
	var data = [];

	// Iterate over the groups
	$('.settings_page .profiles > li:not(.sample)').each(function (index) {

		// Create an new empty object for the group settings
		data[index] = {};

		// Prefs
		data[index]['color'] = $(this).find('.color').val().split(',');
		data[index]['title'] = $(this).find('.title').val();
		data[index]['users'] = $(this).find('.users').val().split(',');

		// Options
		data[index]['background'] = $(this).find('.background').prop('checked');
	});

	// Save settings in localStorage
	port.postMessage({name: "setSetting", key: 'profiles', val: JSON.stringify(data)});

	// Save new settings in database
	database['profiles'] = JSON.stringify(data);

	// Saved indicator
	$('<p class="profile_status">&#10003;</p>').insertAfter($('.settings_page .profile_save'));

	// Remove the idicator in 2 sec
	setTimeout(function () {
		$('.settings_page .profile_status').remove();
	}, 3000);
}