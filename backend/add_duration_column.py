import sqlite3

conn = sqlite3.connect('movies.db')
c = conn.cursor()
# Ajoute la colonne duration si elle n'existe pas déjà
def column_exists():
    c.execute("PRAGMA table_info(films)")
    return any(row[1] == 'duration' for row in c.fetchall())

if not column_exists():
    c.execute('ALTER TABLE films ADD COLUMN duration INTEGER')
    print('Colonne duration ajoutée.')
else:
    print('Colonne duration déjà présente.')
conn.commit()
conn.close()
