import os
from flask import *
from create_database import *
from api import app, access, create_session, allowed_file, verifyJsonValue, jsonResponse


@app.route('/api/song/create', methods=['POST'])
def create():
    try:
        token = request.form['token']
        path = request.form['path']
        title = request.form['title']
        artist = request.form['artist']
        album = request.form['album']
        release = request.form['release']
        year = request.form['year']

        try:
            year = int(year)
        except (ValueError, TypeError):
            return jsonResponse('Error', 'Invalid year', 403)

        user = access(token)

        if user is None or user == "":
            return verifyJsonValue(user, 'Invalid user', 1, 100)

        if verifyJsonValue(path, 'Invalid path', 1, 200) != 0:
            return jsonResponse('Error', 'Invalid path', 403)

        if verifyJsonValue(title, 'Invalid title', 1, 100) != 0:
            return jsonResponse('Error', 'Invalid title', 403)

        if verifyJsonValue(artist, 'Invalid artist', 1, 100) != 0:
            return jsonResponse('Error', 'Invalid artist', 403)

        if verifyJsonValue(album, 'Invalid album', 1, 100) != 0:
            return jsonResponse('Error', 'Invalid album', 403)

        if verifyJsonValue(release, 'Invalid release', 1, 100) != 0:
            return jsonResponse('Error', 'Invalid release', 403)

        if (year is None or year == "") or (year < 0) or (year > 2017):
            return jsonResponse('Error', 'Invalid year', 403)

        if 'file' in request.files:
            songfile = request.files['file']
        else:
            return jsonResponse('Error', 'No file', 403)


        session = create_session()

        song = session.query(Song).filter(Song.path == path).first()

        if song is None:
            song = Song(title = title, artist = artist, album = album, year = year, path = path, user_id = user.id)
            session.add(song)
        else:
            session.close()
            return jsonResponse('Error', 'Song already exists', 403)

        directory = ""
        for i in path.split('/')[:-1]:
            directory += i + '/'
        if not os.path.exists(app.config['UPLOAD_FOLDER'] + directory):
            os.makedirs(app.config['UPLOAD_FOLDER'] + directory)

        if songfile and songfile.filename != '':
            old_file_position = songfile.tell()
            songfile.seek(0, os.SEEK_END)
            size = songfile.tell()
            songfile.seek(old_file_position, os.SEEK_SET)

            if size > 10 * 1024 * 1024:
                return jsonResponse('Error', 'Max song size: 10MB', 403)

            if not allowed_file(songfile.filename.lower()):
                return jsonResponse('Error', 'Wrong file format', 403)

            # if song exists remove the old one
            if os.path.isfile(app.config['UPLOAD_FOLDER'] + path):
                os.remove(app.config['UPLOAD_FOLDER'] + path)

            if allowed_file(songfile.filename.lower()):
                songfile.filename = artist + "-" + title
                songfile.save(app.config['UPLOAD_FOLDER'] + path)

        session.commit()
        session.close()

        return jsonResponse('Success', 'song uploaded', 200)

    except Exception as e:
        print(e)
        return jsonResponse('Error', 'Server Error', 500)
