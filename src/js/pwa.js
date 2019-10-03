/* global document, localStorage */
const settings = document.querySelector('#settings');
const lang = document.querySelector('#lang');
const notice = document.querySelector('#notice');

function getLang() {
	if (localStorage.getItem('lang')) {
		lang.value = localStorage.getItem('lang');
	} else {
		lang.value = 'en';
	}

	lang.hidden = false;
}

getLang();

settings.addEventListener('submit', event => {
	event.preventDefault();
	localStorage.setItem('lang', lang.value);
	const noticeElement = document.createElement('p');
	noticeElement.setAttribute('class', 'in');
	noticeElement.textContent = 'Settings saved.';
	notice.append(noticeElement);

	setTimeout(() => {
		noticeElement.setAttribute('class', 'out');
		setTimeout(() => {
			noticeElement.remove();
		}, 1000);
	}, 5000);
});
