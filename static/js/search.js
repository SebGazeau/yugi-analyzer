export function setupSearch() {
	const input = document.getElementById('search-box');
	const resultsContainer = document.getElementById('searchResults');
	const results = document.getElementById('search-results-list');

	input.addEventListener('input', () => {
		const query = input.value.trim();
		if (query.length < 4) {
			results.innerHTML = '';
			return;
		}

		fetch(`/search?q=${encodeURIComponent(query)}`)
			.then(res => res.json())
			.then(data => {
			results.innerHTML = '';
			data.forEach(card => {
				const div = document.createElement('div');
				div.classList.add('search-result-item');
				// div.textContent = card.name;
				div.addEventListener('click', () => addToDeck(card));
				div.innerHTML = `
					<div>
						<div class="card-name-result">${highlightMatch(card.name, query)}</div>
					</div>
					<div>
						<span class="card-type ${card.type}">${card.type}</span>
					</div>
					<button class="add-to-deck-btn" onclick="addToDeck(${card})">
						+ Ajouter
					</button>
					`
					// <div class="card-info-result">Niv. ${card.level || '-'}</div>
					// <div class="card-info-result">${card.category}</div>
				results.appendChild(div);
			});
			resultsContainer.style.display = 'block';
			document.addEventListener('click', (e) => {
				if (!resultsContainer.contains(e.target)) {
					closeSearch();
				}
			});
		});
	});
}
	
export function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #fef3c7; padding: 0.1rem 0.02rem; border-radius: 3px;">$1</mark>');
}
export function closeSearch() {
	document.getElementById('searchResults').style.display = 'none';
}