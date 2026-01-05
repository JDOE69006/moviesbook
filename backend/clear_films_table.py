import sqlite3

conn = sqlite3.connect('movies.db')
c = conn.cursor()
try:
	c.execute('DELETE FROM films')
	c.execute('DELETE FROM sqlite_sequence WHERE name="films"')
	print('Table films vidée et autoincrement réinitialisé.')
except Exception as e:
	print('Erreur lors du vidage :', e)
conn.commit()
conn.close()
print('Table films vidée.')
