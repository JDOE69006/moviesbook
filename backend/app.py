from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3

import os
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

DATABASE = 'movies.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/films', methods=['GET'])
def get_films():
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 20))
    conn = get_db_connection()
    films = conn.execute('SELECT id, titre, annee, note_globale, image_url FROM films LIMIT ? OFFSET ?', (limit, offset)).fetchall()
    conn.close()
    return jsonify([dict(film) for film in films])

@app.route('/api/films/<int:film_id>', methods=['GET'])
def get_film(film_id):
    conn = get_db_connection()
    film = conn.execute('SELECT * FROM films WHERE id = ?', (film_id,)).fetchone()
    conn.close()
    if film is None:
        return jsonify({'error': 'Film not found'}), 404
    return jsonify(dict(film))


# Servir index.html à la racine
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Servir les fichiers statiques (css, js)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
