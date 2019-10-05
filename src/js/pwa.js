/* global document, localStorage, window */
const settings = document.querySelector('#settings');
const lang = document.querySelector('#lang');
const notice = document.querySelector('#notice');
const searchForm = document.querySelector('#search-form');
const searchField = document.querySelector('#search-field');
const animalFilters = document.querySelector('.animals');
const colorFilters = document.querySelector('.colors');
const savedSearches = document.querySelector('#saved-searches');
let db;

function initDb() {
	const request = window.indexedDB.open('search_db', 1);
	request.addEventListener('error', () => {});

	request.onupgradeneeded = event => {
		const initialDb = event.target.result;
		const objectStore = initialDb.createObjectStore('search_os', {keyPath: 'id', autoIncrement: true});

		objectStore.createIndex('query', 'query', {unique: false});
		objectStore.createIndex('animals', 'animals', {unique: false});
		objectStore.createIndex('colors', 'colors', {unique: false});
	};

	request.onsuccess = () => {
		db = request.result;
		displayData();
	};
}

function getLang() {
	if (localStorage.getItem('lang')) {
		lang.value = localStorage.getItem('lang');
	} else {
		lang.value = 'en';
	}

	lang.hidden = false;
}

initDb();
getLang();

function addData(event) {
	event.preventDefault();

	const result = {
		searchTerm: searchField.value,
		animals: [],
		colors: []
	};
	const animals = animalFilters.querySelectorAll('input:checked');
	animals.forEach(animal => {
		result.animals.push(animal.value);
	});
	const colors = colorFilters.querySelectorAll('input:checked');
	colors.forEach(color => {
		result.colors.push(color.value);
	});

	const transaction = db.transaction(['search_os'], 'readwrite');

	const objectStore = transaction.objectStore('search_os');

	const request = objectStore.add(result);
	request.onsuccess = function () {
		searchField.value = '';
		animals.forEach(animal => {
			animal.checked = false;
		});
		colors.forEach(color => {
			color.checked = false;
		});
	};

	transaction.oncomplete = function () {
		displayData();
	};

	transaction.addEventListener('error', error => {
		console.log(error);
	});
}

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

searchForm.addEventListener('submit', addData);

function displayData() {
	while (savedSearches.firstChild) {
		savedSearches.removeChild(savedSearches.firstChild);
	}

	const objectStore = db.transaction('search_os').objectStore('search_os');
	objectStore.openCursor().onsuccess = function (event) {
		const cursor = event.target.result;
		if (cursor) {
			const listItem = document.createElement('li');
			listItem.dataset.searchId = cursor.value.id;
			const searchQuery = document.createElement('h3');
			searchQuery.textContent = `Search Query: ${cursor.value.searchTerm}`;
			listItem.append(searchQuery);
			if (cursor.value.animals.length > 0) {
				const animalHeader = document.createElement('p');
				animalHeader.textContent = 'Animals:';
				listItem.append(animalHeader);
				const animalsList = document.createElement('ul');
				listItem.append(animalsList);
				cursor.value.animals.forEach(animal => {
					const animalElement = document.createElement('li');
					animalElement.textContent = animal;
					animalsList.append(animalElement);
				});
			}

			if (cursor.value.colors.length > 0) {
				const colorHeader = document.createElement('p');
				colorHeader.textContent = 'Colors:';
				listItem.append(colorHeader);
				const colorsList = document.createElement('ul');
				cursor.value.colors.forEach(color => {
					const colorElement = document.createElement('li');
					colorElement.textContent = color;
					colorsList.append(colorElement);
				});
				listItem.append(colorsList);
			}

			savedSearches.append(listItem);
			const deleteBtn = document.createElement('button');
			listItem.append(deleteBtn);
			deleteBtn.textContent = 'Delete';
			deleteBtn.addEventListener('click', deleteItem);
			cursor.continue();
		} else if (!savedSearches.firstChild) {
			const listItem = document.createElement('li');
			listItem.textContent = 'No searches saved.';
			savedSearches.append(listItem);
		}
	};
}

function deleteItem(event) {
	const searchId = Number(event.target.parentNode.getAttribute('data-search-id'));
	const transaction = db.transaction(['search_os'], 'readwrite');
	const objectStore = transaction.objectStore('search_os');
	const request = objectStore.delete(searchId);
	request.addEventListener('error', () => {});
	transaction.oncomplete = function () {
		event.target.parentNode.parentNode.removeChild(event.target.parentNode);

		if (!savedSearches.firstChild) {
			const listItem = document.createElement('li');
			listItem.textContent = 'No searches saved.';
			savedSearches.append(listItem);
		}
	};
}
