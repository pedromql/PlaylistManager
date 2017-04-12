import os
from flask import *
from create_database import *
from api import app, access, create_session, allowed_file, verifyJsonValue, jsonResponse



@app.route('/api/song/upload', methods=['POST'])
def upload():
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
            return jsonResponse('Error','Invalid year',403)

        user = access(token)

        if verifyJsonValue(user,'Invalid user') != 0:
            return verifyJsonValue(user,'Invalid user')

        if verifyJsonValue(path,'Invalid path') != 0:
            return verifyJsonValue(path,'Invalid path')

        if verifyJsonValue(title,'Invalid title') != 0:
            return verifyJsonValue(title,'Invalid title')

        if verifyJsonValue(artist,'Invalid artist') != 0:
            return verifyJsonValue(artist,'Invalid artist')

        if verifyJsonValue(album,'Invalid album') != 0:
            return verifyJsonValue(album,'Invalid album')

        if verifyJsonValue(release,'Invalid release') != 0:
            return verifyJsonValue(release,'Invalid release')

        if (verifyJsonValue(year,'Invalid year') != 0) or (year<0) or (year > 2017):
            return jsonResponse('Error','Invalid year',403)

        if 'file' in request.files:
            song = request.files['file']
        else:
            return jsonResponse('Error','No file',403)

        # files created inside folder music
        if not os.path.exists(app.config['UPLOAD_FOLDER'] + path):
            os.makedirs(app.config['UPLOAD_FOLDER'] + path)

        if song and song.filename != '':
            old_file_position = song.tell()
            song.seek(0, os.SEEK_END)
            size = song.tell()
            song.seek(old_file_position, os.SEEK_SET)

            if size > 10 * 1024 * 1024:
                return jsonResponse('Error','Max song size: 10MB',403)

            if not allowed_file(song.filename.lower()):
                return jsonResponse('Error', 'Wrong file format', 403)


            #if song exists remove the old one
            if os.path.isfile(app.config['UPLOAD_FOLDER'] +'/'+ path +'/'+ artist + "-" + title + ".mp3"):
                os.remove(app.config['UPLOAD_FOLDER'] +'/'+ path +'/'+ artist + "-" + title + ".mp3")

            if allowed_file(song.filename.lower()):
                song.filename = artist + "-" + title
                song.save(app.config['UPLOAD_FOLDER'] +'/'+ path +'/'+ artist + "-" + title + ".mp3")



        return jsonResponse('Success','song uploaded',200)

    except Exception as e:
        print(e)
        return jsonResponse('Error','Server Error',500)





