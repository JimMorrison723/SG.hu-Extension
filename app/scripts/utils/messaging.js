export const windowBrowser = (function () {
	return window.msBrowser ||
		window.browser ||
		window.chrome;
})();

export const port = windowBrowser.extension.connect();