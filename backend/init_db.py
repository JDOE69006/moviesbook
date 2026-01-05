import sqlite3

conn = sqlite3.connect('movies.db')
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    resume TEXT,
    anecdotes TEXT,
    distribution TEXT,
    categorie TEXT,
    annee INTEGER,
    distributeurs TEXT,
    commentaires TEXT,
    bande_annonce TEXT,
    note_globale REAL,
    note_violence REAL,
    note_sexe REAL,
    note_humour REAL,
    note_peur REAL,
    note_drogue REAL,
    note_utilisateur REAL,
    age_interdit REAL,
    age_recommande REAL,
    realisateur TEXT,
    scenariste TEXT,
    duration REAL,
    image_url TEXT
)
''')
conn.commit()
conn.close()
