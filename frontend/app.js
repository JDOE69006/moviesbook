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



async function showFilmDetails(id) {
    const modal = document.getElementById('modal-test');
    const content = document.getElementById('modal-test-content');
    if (!modal || !content) {
        alert('Erreur : la modal de test n\'existe pas dans le DOM.');
        return;
    }
    // Récupérer les infos détaillées du film
    const res = await fetch(`http://localhost:5000/api/films/${id}`);
    const film = await res.json();
    document.body.classList.add('modal-blur');
    modal.style.display = 'flex';

    // Helpers debug
    const titre = film.titre || '<span style="color:#d32f2f">donnée manquante</span>';
    const annee = film.annee || '<span style="color:#d32f2f">donnée manquante</span>';
    const duration = film.duration || '<span style="color:#d32f2f">donnée manquante</span>';

    // Catégories sous forme de boutons arrondis
    let categoriesHtml = '';
    if (film.categorie) {
        const cats = film.categorie.split('|').map(cat => cat.trim()).filter(Boolean);
        categoriesHtml = cats.map(cat => `<span class="modal-cat-btn">${cat}</span>`).join(' ');
    } else {
        categoriesHtml = `<span class="modal-cat-btn missing">catégorie manquante</span>`;
    }

    const cover = film.image_url ? `<img src="${film.image_url}" alt="cover" style="width:180px;height:270px;object-fit:cover;border-radius:10px;box-shadow:0 2px 8px #0002;" onerror="this.onerror=null;this.src='assets/cover/placeholder.png';">` : `<div style='width:180px;height:270px;background:#444;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;'>Image<br>manquante</div>`;

    // Bande annonce intégrée (YouTube)
    let trailerEmbed = '';
    if (film.bande_annonce && film.bande_annonce.includes('youtube.com')) {
        const ytId = film.bande_annonce.split('v=')[1]?.split('&')[0];
        if (ytId) {
            trailerEmbed = `<iframe width="320" height="270" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>`;
        }
    }
    if (!trailerEmbed) {
        trailerEmbed = `<div style='width:320px;height:270px;background:#222;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.95em;'>Bande annonce<br>manquante</div>`;
    }

        // Génération des badges d'âge avec code couleur
        function ageBadge(age, type) {
            if (age === undefined || age === null || age === '' || isNaN(age)) return '';
            let color = '#4caf50'; // vert par défaut
            if (age >= 18) color = '#d32f2f'; // rouge
            else if (age >= 16) color = '#ff9800'; // orange
            else if (age >= 12) color = '#1976d2'; // bleu
            else if (age >= 6) color = '#43a047'; // vert foncé
            const tooltip = type === 'interdit' ? 'déconseillé pour' : 'recommandé à partir de';
            return `<span class="age-badge age-badge-${type}" style="background:${color};margin-left:0.5em;" title="${tooltip} ${age}+">${type === 'interdit' ? '⛔' : '🎯'} ${age}+</span>`;
        }

        const badges = `
            ${ageBadge(film.age_interdit, 'interdit')}
            ${ageBadge(film.age_recommande, 'recommande')}
        `;

        content.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:flex-start;gap:0.5em;">
                <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:0.1em;">
                    <span style="font-size:2em;font-weight:bold;text-align:left;">${titre}</span>
                    <span>${badges}</span>
                </div>
                <div style="display:flex;align-items:center;gap:1em;font-size:1.1em;color:#bbb;margin-bottom:0.5em;">
                    <span>${annee}</span> <span>-</span> <span>${duration} min</span>
                </div>
                <div style="display:flex;flex-direction:row;gap:1.2em;width:100%;justify-content:flex-start;align-items:flex-start;">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        ${cover}
                        <div style="margin-top:0.7em;display:flex;flex-wrap:wrap;gap:0.5em;justify-content:center;">${categoriesHtml}</div>
                    </div>
                    ${trailerEmbed}
                </div>
                <div style="margin-top:1.2em;width:100%;">
                    <div class="modal-resume">${film.resume}</div>
                    <div><b>Notes :</b> Globale ${film.note_globale} | Violence ${film.note_violence} | Sexe ${film.note_sexe} | Humour ${film.note_humour} | Peur ${film.note_peur}</div>
                </div>
            </div>
        `;
}

// Fermer la modal de test avec la croix
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-test');
    const closeBtn = document.getElementById('modal-test-close');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-blur');
            document.getElementById('modal-test-content').innerHTML = '';
            e.stopPropagation();
        };
    }
    // Fermer la modal en cliquant sur le fond
    if (modal) {
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-blur');
                document.getElementById('modal-test-content').innerHTML = '';
            }
        };
    }
});




// Listener modal de test (ajouté dans DOMContentLoaded si besoin)

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadFilms();
    }
});

// Initial load
loadFilms();
