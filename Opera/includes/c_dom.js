// ==UserScript==
// @include http://sg.hu/*
// @include https://sg.hu/*
// @include http://www.sg.hu/*
// @include https://www.sg.hu/*
// @include http://*.sg.hu/*
// @include https://*.sg.hu/*
// ==/UserScript==

$(document).ready(function() {
	
	// Faves
	$('.b-h-o-head:eq(2)').addClass('ext_faves');
	
	// Left sidebar
	$('table:eq(3) td:eq(0)').attr('id', 'ext_left_sidebar');
	
	// Right sidebar
	$('table:eq(3) td:eq(2) table:first tr > td:eq(2)').attr('id', 'ext_right_sidebar');
});