/* @flow */

/* from https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/browser/utils/api.js */

/* eslint-env webextensions */

// noinspection JSAnnotator
export function apiToPromise(func: (...args: mixed[]) => void): (...args: mixed[]) => Promise<any> {
	return (...args) =>
		new Promise((resolve, reject) =>
			func(...args, (...results) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			})
		);
}