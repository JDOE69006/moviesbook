import sqlite3

conn = sqlite3.connect('movies.db')
c = conn.cursor()
c.execute('DELETE FROM films')
conn.commit()
conn.close()
print('Table films vidée.')
