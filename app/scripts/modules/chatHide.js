import { Module } from '../core/module';
import { formatDate, formatDateDiff, formatNumber, getUserInfo, loggedInUser } from '../utils';

/*export const module: Module<*> = new Module('showKarma');*/

module.moduleName = 'chatHide';
module.category = 'MainPage';
module.description = 'chatHide';
module.options = {
	chatHide: {
		title: 'chatElrejtése',
		type: 'boolean',
		value: false,
		description: 'chatElrejtéseAFőoldalon',
	}
};

/*module.go = async () => {
	activated();
};*/

function activated() {
	console.log('chat hide activated');
	$('#forum-chat').hide();
	let wrap = $('#forum-wrap');
	wrap.find('.blue-border-top').hide();
	wrap.find('.forums-block:first').css({'margin-top': '0px'});
}