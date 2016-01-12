$(document).ready(function() {
	
	if(document.location.href.match('forum\/$')) {

		// Welcome block
		$('.user-hello').addClass('ext_welcome');

		// Faves
		$('#sidebar-user-favorites').addClass('ext_faves');
	
		// Left sidebar
		//$('section[id*=sidebar])').attr('id', 'ext_left_sidebar');
	
		// Right sidebar
		//$('table:eq(3) td:eq(2) table:first tr > td:eq(2)').attr('id', 'ext_right_sidebar');
	}
});