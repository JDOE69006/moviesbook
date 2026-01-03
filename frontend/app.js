let offset = 0;
const limit = 20;
let loading = false;
const grid = document.getElementById('films-grid');
const loader = document.getElementById('loader');

async function loadFilms() {
    if (loading) return;
    loading = true;
    loader.style.display = 'block';
    const res = await fetch(`http://localhost:5000/api/films?offset=${offset}&limit=${limit}`);
    const films = await res.json();
    films.forEach(film => {
        const card = document.createElement('div');
        card.className = 'film-card';
        card.innerHTML = `
            <img src="${film.image_url}" alt="${film.titre}" onerror="this.onerror=null;this.src='assets/cover/placeholder.png';">
            <div class="title">${film.titre}</div>
            <div class="year">${film.annee || ''}</div>
            <div class="note">Note : ${film.note_globale || '-'} </div>
        `;
        card.onclick = () => showFilmDetails(film.id);
        grid.appendChild(card);
    });
    offset += films.length;
    loader.style.display = films.length < limit ? 'none' : 'block';
    loading = false;
}

function showFilmDetails(id) {
    // À compléter : affichage modal ou page détail
    alert('Détail du film ' + id);
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadFilms();
    }
});

// Initial load
loadFilms();
