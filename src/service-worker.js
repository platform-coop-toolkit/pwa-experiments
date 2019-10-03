/* global addEventListener, fetch, Response */
addEventListener('fetch', fetchEvent => {
	const {request} = fetchEvent;
	fetchEvent.respondWith(
		fetch(request).then(responseFromFetch => {
			return responseFromFetch;
		})
			.catch(error => {
				return new Response(error);
			})
	);
});
