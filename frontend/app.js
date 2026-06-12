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
    const trailerWidth = 320;
    const trailerHeight = 270;
    if (film.bande_annonce && film.bande_annonce.includes('youtube.com')) {
        const ytId = film.bande_annonce.split('v=')[1]?.split('&')[0];
        if (ytId) {
            trailerEmbed = `<iframe width="${trailerWidth}" height="${trailerHeight}" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:10px;display:block;"></iframe>`;
        }
    }
    if (!trailerEmbed) {
        trailerEmbed = `<div style='width:${trailerWidth}px;height:${trailerHeight}px;background:#222;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.95em;'>Bande annonce<br>manquante</div>`;
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

        // Génération des barres de notes graduées
        function noteBar(note, color, icon, label) {
            let html = '';
            if (note === undefined || note === null || note === '' || isNaN(note)) {
                html = `<span class=\"note-bar-grayed\" title=\"non défini\">`;
                for (let i = 0; i < 5; i++) html += `<span class=\"note-dot\"></span>`;
                html += `</span>`;
            } else {
                html = `<span class=\"note-bar\" title=\"${label} : ${note}/5\">`;
                for (let i = 1; i <= 5; i++) {
                    html += `<span class=\"note-dot\" style=\"background:${i <= note ? color : '#444'}\"></span>`;
                }
                html += `</span>`;
            }
            // Icône à droite, avec tooltip
            return `<div class=\"note-bar-row\">${html}<span class=\"note-icon\" title=\"${label}\">${icon}</span></div>`;
        }
        // Icônes : violence = poing, sexe = cœur, complexité = cerveau, langage = bulle BD, drogue = coupe
        const notesHtml = `
            <div class="note-bars-vertical">
                ${noteBar(film.note_violence, '#d32f2f', '👊', 'Violence')}
                ${noteBar(film.note_sexe, '#e91e63', '❤️', 'Sexe')}
                ${noteBar(film.note_complexite, '#ffeb3b', '🧠', 'Complexité')}
                ${noteBar(film.note_language, '#1976d2', '💬', 'Langage')}
                ${noteBar(film.note_drogue, '#8d6e63', '🍾', 'Drogue')}
            </div>
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
                <div style="display:flex;flex-direction:row;width:740px;max-width:98vw;justify-content:space-between;align-items:flex-start;">
                    <div style='display:flex;flex-direction:column;align-items:flex-start;width:180px;min-width:180px;max-width:180px;'>
                        ${cover}
                    </div>
                    <div style='width:24px;min-width:24px;max-width:24px;'></div>
                    <div style='display:flex;flex-direction:column;align-items:flex-start;width:${trailerWidth}px;min-width:${trailerWidth}px;max-width:${trailerWidth}px;'>${trailerEmbed}</div>
                    <div style='display:flex;flex:1;'></div>
                    <div style='display:flex;flex-direction:column;align-items:flex-end;width:60px;min-width:60px;max-width:60px;margin-right:8px;'>${notesHtml}</div>
                </div>
                <div class="categories-row-modal">${categoriesHtml}</div>
                <div class="resume-row-modal"><div class='modal-resume'>${film.resume}</div></div>
                <!-- résumé déplacé dans resume-row-modal -->
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
