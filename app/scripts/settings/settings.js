import { port } from '../utils/messaging';
import { database } from "../utils/options";
import { profilesCpInit} from "./profilesCp";
import { logInit } from "./log"
import { blocklistInit } from "./blocklist"

/*!
 * settings.js
 */
export function cpInit(page) {

	// Create the settings button
	$('<div id="ext_settings_button"><img src="' + chrome.extension.getURL('/images/settings/icon.png') + '" alt=""></div>').appendTo('body');

	// Create the hiding overlay
	$('<div id="ext_settings_hide_overlay"></div>').appendTo('body');

	// Create click event for settings pane
	$('#ext_settings_button').click(function () {

		if ($('#ext_settings_wrapper').hasClass('opened')) {
			cpHide();
		} else {
			cpShow();
		}
	});

	// Inject the html code
	var html = '';

	html += '<div id="ext_settings_wrapper">';
	html += '<ul id="ext_settings_header">';
	html += '<li>Névjegy</li>';
	html += '<li>Főoldal</li>';
	html += '<li>Topik</li>';
	html += '<li>Egyéb</li>';
	html += '<li>Profilok</li>';
	html += '<li>Tiltólista</li>';
	html += '<li>Logger</li>';
	html += '<li class="clear"></li>';
	html += '</ul>';

	html += '<div class="settings_page">';
	html += '<h3>SG Fórum tuning</h3>';
	html += '<p>Verzió: $build:version</p>';
	html += '<p>Kiadás dátuma: 2017. 07. 15.</p>';
	html += '<p>Fejlesztő: JimMorrison723 <a href="http://jimmorrison723.hu" target="_blank">http://jimmorrison723.hu</a>, Gera János "dzsani" <a href="http://kreaturamedia.com" target="_blank">http://kreaturamedia.com</a></p>';
	html += '<p>Közreműködők: Viszt Péter "passatgt" <a href="http://visztpeter.me" target="_blank">http://visztpeter.me</a>, Krupa György "pyro" <a href="http://kreaturamedia.com" target="_blank">http://kreaturamedia.com</a></p>';
	html += '</div>';

	html += '<div class="settings_page">';
	html += '<div>';
	html += '<h3>Chat elrejtése</h3>';
	html += '<p>Ezzel az opcióval a fórum főoldalon levő közös chatet tüntethted el maradéktalanul.</p>';
	html += '<div class="button" id="chatHide"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Csak olvasatlan üzenttel rendelkező kedvencek mutatása</h3>';
	html += '<p class="sub">';
	html += '<label><input type="checkbox" id="favShowOnlyUnreadedRemember"> Utolsó állapot megjegyzése</label><br>';
	html += '</p>';
	html += '<p>A fórum főoldalán található kedvencek listában csak az olvasatlan üzenettel rendelkező topikok lesznek listázva. A bővítmény létrehoz tovább egy kapcsolót a kedvencek cím mellett mellyel könnyen visszaválthatsz a régi nézetre.</p>';
	html += '<div class="button" id="favShowOnlyUnreaded"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Rövid kommentjelzők</h3>';
	html += '<p>A főoldali kedvencek listában nem jelenik meg helyet foglalva új sorban az "N új üzeneted érkezett" szöveg, ehelyett helytakarékos módon csak egy piros szám jelzi az új üzeneteket a topik neve mellett.</p>';
	html += '<div class="button" id="shortCommentMarker"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Fórumkategóriák kiemelése</h3>';
	html += '<p>A fórum főoldalon átalakított, átdizájnolt listákat láthatsz, mely jobban kiemeli többek között a kedvenceknél a fórumkategóriákat is.</p>';
	html += '<div class="button" id="highlightForumCategories"></div>';
	html += '</div>';
	/*html += '<div>';
	html += '<h3>Blokkok átrendezése, rejtése</h3>';
	html += '<p class="sub">';
	html += '<label><input type="checkbox" id="hideBlocksButtons"> Átrendező gombok elrejtése</label><br>';
	html += '<button type="button" id="resetBlocksConfig">Alapbeállítások visszaállítása</button>';
	html += '</p>';
	html += '<p>A fórum főoldal oldalsávjain található blokkok tetszőleges átrendezése, rejtése.</p>';
	html += '<div class="button" id="customBlocks"></div>';
	html += '</div>';*/
	/*html += '<div>';
	 html += '<h3>Üzenetközpont (BÉTA)</h3>';
	 html += '<p>Saját üzenetek naplózása, azokra érkező válaszok nyomkövetése.</p>';
	 html += '<div class="button" id="messageCenter"></div>';
	 html += '</div>';*/
	html += '</div>';

	html += '<div class="settings_page">';
	html += '<div>';
	html += '<h3>Ugrás az utolsó üzenethez</h3>';
	html += '<p>Az "ugrás az utolsó olvasatlan üzenethez" több oldalon keresztül is működik, egy topikba lépve automatikusan az utolsó üzenethez görget.</p>';
	html += '<div class="button" id="jumpUnreadedMessages"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Következő oldal betöltése a lap aljára érve</h3>';
	html += '<p>A lap aljára görgetve a bővítmény a háttérben betölti a következő oldal tartalmát, majd megjeleníti az új kommenteket oldalfrissítés vagy lapozás nélkül.</p>';
	html += '<div class="button" id="autoloadNextPage"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Overlay kommentmező</h3>';
	html += '<p>Egy hozzászólásra válaszolva az oldal nem ugrik fel a felső textarához, ehelyett kiemeli a megválaszolandó kommentet és egy overlay szövegmező jelenik meg alatta.</p>';
	html += '<div class="button" id="overlayReplyTo"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Nekem érkező üzenetek kiemelése</h3>';
	html += '<p>Bármely topikban a neked címzett üzenetek mellé egy narancssárga nyíl kerül, ezzel jelezve hogy ezt az üzenetet neked szánták.</p>';
	html += '<div class="button" id="highlightCommentsForMe"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Kommentek szálonkénti elrendezése</h3>';
	html += '<p>Bármely topikban a megkezdett beszélgetéseket szálonként átrendezi a script. Egy megválaszolt üzenet az eredeti üzenet alá kerül, ezzel jelezve és elkülönítve az egymásnak szánt üzeneteket.</p>';
	html += '<div class="button" id="threadedComments"></div>';
	html += '</div>';
	/*html += '<div>';
	html += '<h3>WYSIWYG Editor</h3>';
	html += '<p>Office-szerű formázógombokat kapsz a kommentíró mezőbe élő előnézettel.</p>';
	html += '<div class="button" id="wysiwyg_editor"></div>';
	html += '</div>';*/
	html += '<div>';
	html += '<h3>Topikba érkező új üzenetek automatikus kinyerése</h3>';
	html += '<p>Amíg egy topikban tartózkodsz, a bővítmény automatikusan kinyeri az olvasás ideje alatt érkező új üezenteket.</p>';
	html += '<div class="button" id="fetchNewComments"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Navigációs gombok megjelenítése</h3>';
	html += '<p class="sub">';
	html += 'Gombok helye: ';
	html += '<select id="navigationButtonsPosition">';
	html += '<option value="lefttop">Bal felül</option>';
	html += '<option value="leftcenter">Bal középen</option>';
	html += '<option value="leftbottom">Bal alul</option>';
	html += '<option value="righttop">Jobb felül</option>';
	html += '<option value="rightcenter">Jobb középen</option>';
	html += '<option value="rightbottom">Jobb alul</option>';
	html += '</select>';
	html += '</p>';
	html += '<p class="sub">';
	html += '<label><input type="checkbox" id="showNavigationButtonsNight"> Éjszakai / szemkímélő mód kapcsoló</label><br>';
	html += '</p>';
	html += '<p>Egy topikban vagy a cikkeknél gyors elérést biztosító funkciógombok</p>';
	html += '<div class="button" id="showNavigationButtons"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Pontrendszer letiltása</h3>';
	html += '<p>Ez az opció eltávolítja a pontozó gombokat és minden rejtett hozzászólást láthatóvá tesz.</p>';
	html += '<div class="button" id="disablePointSystem"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Hosszú kommentek oszloposítása</h3>';
	html += '<p>Meghatározott karakterszám felett a bővítmény oszlopokra bontja az üzeneteket a könnyebb olvashatóság miatt. </p>';
	html += '<div class="button" id="columnifyComments"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Info gomb a hozzászólás fejlécében</h3>';
	html += '<p>Létrehoz egy "info" gombot a hozzászólás fejlécében, amiben megjelennek a felhasználó adatai.</p>';
	html += '<div class="button" id="quickUserInfo"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Gyors beszúrás</h3>';
	html += '<p>A vágólapról bemásolt linket autómatikusan bbcode tagek közé rakja.</p>';
	html += '<div class="button" id="quickInsertion"></div>';
	html += '</div>';
	html += '<div>';
	html += '<h3>Külső média hivatkozások előnézete</h3>';
	html += '<p>Hozzászólásokban a hivatkozások után egy kis gombra kattintva betöltődik a hivatkozott tartalom (kép, videó, tweet).</p>';
	html += '<div class="button" id="inlineImageViewer"></div>';
	html += '</div>';
	html += '</div>';

	html += '<div class="settings_page">';
	html += '<div>';
	html += '<h3>Reklámok blokkolása</h3>';
	html += '<p>Ezzel az opcióval eltávolítható az összes reklám az sg.hu-n. (Továbbá a fórum főoldalon található FB doboz!)</p>';
	html += '<div class="button" id="removeAds"></div>';
	html += '</div>';
	html += '</div>';

	html += '<div class="settings_page">';
	html += '<ul class="profiles">';
	html += '<li class="sample">';
	html += '<input type="hidden" name="color" class="color" value="ff4242,ffc9c9">';
	html += '<span class="color" style="background-color: #ff4242"></span>';
	html += '<input type="text" name="title" class="title" value="Profil elnevezése">';
	html += '<ul>';
	html += '<li style="background-color: #ffc9c9"><span>ff4242,ffc9c9</span></li>';
	html += '<li style="background-color: #f2c9ff"><span>d13eff,f2c9ff</span></li>';
	html += '<li style="background-color: #c6c6ff"><span>4242ff,c6c6ff</span></li>';
	html += '<li style="background-color: #c6e9ff"><span>4ebbff,c6e9ff</span></li>';
	html += '<li style="background-color: #d5ffc6"><span>6afe36,d5ffc6</span></li>';
	html += '<li style="background-color: #fdffc6"><span>f8ff34,fdffc6</span></li>';
	html += '<li style="background-color: #ffe7c6"><span>ffa428,ffe7c6</span></li>';
	html += '<li style="background-color: #e1e1e1"><span>a9a9a9,e1e1e1</span></li>';
	html += '</ul>';
	html += '<textarea name="users" class="users">Felhasználók</textarea>';
	html += '<p class="options">';
	html += 'Opciók:';
	html += '<label><input type="checkbox" name="background" class="background"> Hozzászólás hátterének kiemelése</label>';
	html += '</p>';
	html += '<p class="remove">eltávolít</p>';
	html += '</li>';
	html += '</ul>';
	html += '<button class="profile_save">Változások mentése</button>';
	html += '<a href="#" class="new_profile">Új csoport hozzáadása</a>';
	html += '</div>';

	html += '<div class="settings_page">';
	html += '<ul id="ext_blocklist">';
	html += '<li id="ext_empty_blocklist">Jelenleg üres a tiltólistád</li>';
	html += '</ul>';
	html += '</div>';

	html += '<div class="settings_page debugger">';
	html += '<h3>Debugger</h3>';
	html += '<textarea readonly="readonly">';

	html += '</textarea>';
	html += '<button>Törlés</button>';
	html += '</div>';

	html += '</div>';


	// Append settings pane html to body
	$(html).appendTo('body');

	var ext_header = $('#ext_settings_header');
	var settings_button = $('.settings_page .button');

	// Set header list backgrounds
	ext_header.find('li').css({'background-image': 'url(' + chrome.extension.getURL('/images/settings/icons.png') + ')'});

	// Create tabs event
	ext_header.find('li').click(function () {

		cpTab($(this).index());
	});

	// Add buttons background image
	settings_button.css({'background-image': 'url(' + chrome.extension.getURL('/images/settings/button.png') + ')'});

	// Get the requested page number
	var sPage = typeof page === "undefined" ? 0 : page;

	// Select the right page
	cpTab(sPage);

	// Set-up blocklist
	blocklistInit();

	// Close when clicking away
	$('#ext_settings_hide_overlay').click(function () {
		cpHide();
	});

	// Restore settings
	settingsRestore();

	// Settings change event, saving
	settings_button.click(function () {
		cpButton(this);
	});

	// Set checkboxes
	$('.settings_page input:checkbox').click(function () {
		settingsSave(this);
	});


	// Set select boxes
	$('.settings_page select').change(function () {
		settingsSelect(this);
	});


	// Reset blocks config
	$('#reset_blocks_config').click(function () {
		port.postMessage({name: "setSetting", key: 'blocks_config', val: ''});
	});

	// Init profiles settings
	profilesCpInit();

	// Init log
	logInit();
}

function cpShow() {

	var ext_h_overlay = $('#ext_settings_hide_overlay');
	var ext_s_wrapper = $('#ext_settings_wrapper');

	// Set the overlay
	ext_h_overlay.css({display: 'block', opacity: 0});
	ext_h_overlay.animate({opacity: 0.6}, 200);

	// Get the viewport and panel dimensions
	var viewWidth = $(window).width();
	var paneWidth = ext_s_wrapper.width();
	var paneHeight = ext_s_wrapper.height();
	var leftProp = viewWidth / 2 - paneWidth / 2;

	// Apply calculated CSS settings to the panel
	ext_s_wrapper.css({left: leftProp, top: '-' + (paneHeight + 10) + 'px'});

	// Reveal the panel
	ext_s_wrapper.delay(250).animate({top: 10}, 250);

	// Add 'opened' class
	ext_s_wrapper.addClass('opened');

}

function cpHide() {

	var ext_s_wrapper = $('#ext_settings_wrapper');

	// Get the settings pane height
	var paneHeight = ext_s_wrapper.height();

	// Hide the pane
	ext_s_wrapper.animate({top: '-' + (paneHeight + 10) + 'px'}, 200, function () {

		// Hide the settings pane
		$(this).css('top', -9000);

		// Restore the overlay
		$('#ext_settings_hide_overlay').animate({opacity: 0}, 100, function () {
			$(this).css('display', 'none');
		});

		// Remove 'opened' class
		$('#ext_settings_wrapper').removeClass('opened');
	});
}

function cpTab(index) {

	var ext_s_wrapper = $('#ext_settings_wrapper');
	var settings_page = $('.settings_page');
	var ext_settings_header = $('#ext_settings_header');

	// Set the current height to prevent resize
	ext_s_wrapper.css({height: ext_s_wrapper.height()});

	// Hide all tab pages
	settings_page.css('display', 'none');

	// Show the selected tab page
	settings_page.eq(index).fadeIn(250);

	// Get new height of settings pane
	var newPaneHeight = ext_settings_header.height() + settings_page.eq(index).outerHeight();

	// Animate the resize
	ext_s_wrapper.stop().animate({height: newPaneHeight}, 150, function () {

		// Set auto height
		ext_s_wrapper.css({height: 'auto'});
	});

	// Remove all selected background in the header
	ext_settings_header.find('li').removeClass('on');

	// Add selected background to the selectad tab button
	ext_settings_header.find('li').eq(index).addClass('on');
}
function cpButton(ele) {

	if ($(ele).hasClass('on')) {
		$(ele).animate({'background-position-x': 0}, 300);
		$(ele).attr('class', 'button off');

		settingsSave(ele);
	} else {

		$(ele).animate({'background-position-x': -40}, 300);
		$(ele).attr('class', 'button on');

		settingsSave(ele);
	}
}

export function settingsRestore() {

	// Restore settings for buttons
	$('.settings_page .button').each(function () {

		if (database[$(this).attr('id')] === true) {
			$(this).attr('class', 'button on');

		} else {
			$(this).attr('class', 'button off');
		}
	});

	// Restore settings for checkboxes
	$('input:checkbox').each(function () {

		if (database[$(this).attr('id')] === true) {
			$(this).attr('checked', true);
		} else {
			$(this).attr('checked', false);
		}
	});

	// Restore settings for select boxes
	$('.settings_page select').each(function () {

		$(this).find('option[value="' + database[$(this).attr('id')] + '"]').attr('selected', true);
	});
}

export function settingsSave(ele) {

	if ($(ele).hasClass('on') || $(ele).prop('checked') === true || $(ele).is(':checked')) {
		// Save new settings ...
		port.postMessage({name: "setSetting", key: $(ele).attr('id'), val: true});

		// Set new value to database var
		database[$(ele).attr('id')] = true;

		// Check for interactive action
		if (typeof window[$(ele).attr('id')].activated !== 'undefined') {
			//Todo
			//window[$(ele).attr('id')].activated();
		}

	} else {

		// Save new settings ...
		port.postMessage({name: "setSetting", key: $(ele).attr('id'), val: false});

		// Set new value to database var
		database[$(ele).attr('id')] = false;

		// Check for interactive action
		if (typeof window[$(ele).attr('id')].disabled !== 'undefined') {
			//Todo
			//window[$(ele).attr('id')].disabled();
		}
	}
}

export function settingsSelect(ele) {

	// Get the settings value
	var val = $(ele).find('option:selected').val();

	// Update in database
	database[$(ele).attr('id')] = val;

	// Update in localStorage
	port.postMessage({name: "setSetting", key: $(ele).attr('id'), val: val});
}