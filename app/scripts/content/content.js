import { port } from '../utils/messaging.js';
import { cpInit } from "../settings/settings";
import { database } from "../utils/options";

export function extInit() {
	if (document.location.href === 'https://sg.hu/felhasznalo/beallitasok') {
		//update_settings.activated();
	}

	// SG index.php
	if (document.location.href === 'https://sg.hu/' || document.location.href.match(/index.php/)) {

		// Settings
		cpInit(3);

		// Articles
	} else if (document.location.href.match(/cikkek/)) {
		// Settings
		cpInit(2);


		// FORUM
	} else if (document.location.href.match(/forum\/$/)) {
		// Settings
		cpInit(1);

	}
	// TOPIK
	else if (document.location.href.match(/forum\/tema/)) {
		// Settings
		cpInit(2);

	}
}