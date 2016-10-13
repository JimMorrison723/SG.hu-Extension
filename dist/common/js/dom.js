$(document).ready(function() {
	
	if(document.location.href.match(/forum\/$/)) {

		// Welcome block
		$('.user-hello').addClass('ext_welcome');

		// Faves
		$('#sidebar-user-favorites').addClass('ext_faves');
	
		// Left sidebar
		$('#sidebar-forum').addClass('ext_left_sidebar');
	
		// Right/center sidebar
		$('#forum-wrap').addClass('ext_right_sidebar');
	}
});