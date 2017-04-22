import os
from flask import *
from create_database import *
from api import app, access, create_session, allowed_file, verifyJsonValue, jsonResponse, getToken
from api.song import accessSong


@app.route("/api/song/play", methods=['GET'])
def play_song():
    token = request.args.get('token')
    songid = request.args.get('songid')
    # verify if token and request are correct and check them in database
    if token is None or token == 1:
        return jsonResponse('Error', 'Server Error', 500)

    user = access(token)
    if user is None:
        return jsonResponse('Error', 'Invalid user', 403)

    file = accessSong(songid)
    if file is None:
        return jsonResponse('Error', 'Invalid file id', 403)

    try:
        session = create_session()

        song = session.query(Song).filter(Song.id == songid).first()
        #session.commit()
        session.close()
        return send_file("/opt/python/current/app/static/Music/" + str(song.id) + ".mp3", mimetype='audio/mpeg3')

    except Exception as e:
        print(e)
        return jsonResponse('Error', 'Server Error', 500)