/* global addEventListener, caches, fetch */

const staticCacheName = 'staticFiles';

addEventListener('install', installEvent => {
	installEvent.waitUntil(
		caches.open(staticCacheName)
			.then(staticCache => {
				return staticCache.addAll([
					'/css/pwa.css',
					'/js/pwa.js'
				]);
			})
	);
});

addEventListener('fetch', fetchEvent => {
	const {request} = fetchEvent;
	fetchEvent.respondWith(
		caches.match(request)
			.then(responseFromCache => {
				if (responseFromCache) {
					return responseFromCache;
				}

				return fetch(request);
			})
	);
});
