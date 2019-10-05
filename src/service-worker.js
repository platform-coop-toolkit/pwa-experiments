/* global addEventListener, caches, clients, fetch, skipWaiting */

const version = '20191004.6';
const staticCacheName = version + 'staticFiles';

addEventListener('install', installEvent => {
	skipWaiting();
	installEvent.waitUntil(
		caches.open(staticCacheName)
			.then(staticCache => {
				return staticCache.addAll([
					'/css/pwa.css',
					'/js/pwa.js',
					'/offline/index.html'
				]);
			})
	);
});

addEventListener('activate', activateEvent => {
	activateEvent.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== staticCacheName) {
						return caches.delete(cacheName);
					}

					return true;
				})
			);
		}).then(() => {
			return clients.claim();
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

				return fetch(request)
					.catch(() => {
						return caches.match('/offline/index.html');
					});
			})
	);
});
