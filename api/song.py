import os
from flask import *
from create_database import *
from api import app, access, create_session, allowed_file, verifyJsonValue, jsonResponse, getToken


@app.route('/api/song/create', methods=['POST'])
def createsong():
	try:
		token = request.form['token']
		title = request.form['title']
		artist = request.form['artist']
		album = request.form['album']
		year = request.form['year']

		try:
			year = int(year)
		except (ValueError, TypeError):
			return jsonResponse('Error', 'Invalid year', 403)

		user = access(token)

		if user is None or user == "":
			return jsonResponse('Error', 'Invalid user', 403)

		if verifyJsonValue(title, 1, 100) != 0:
			return jsonResponse('Error', 'Invalid title', 403)

		if verifyJsonValue(artist, 1, 100) != 0:
			return jsonResponse('Error', 'Invalid artist', 403)

		if verifyJsonValue(album, 1, 100) != 0:
			return jsonResponse('Error', 'Invalid album', 403)

		if (year is None or year == "") or (year < 0) or (year > 2017):
			return jsonResponse('Error', 'Invalid year', 403)

		if 'file' in request.files:
			songfile = request.files['file']
		else:
			return jsonResponse('Error', 'No file', 403)

		session = create_session()


		song = Song(title=title, artist=artist, album=album, year=year, user_id=user.id)
		session.add(song)
		session.flush()


		# session.refresh(song)
		# print(song.id)

		if songfile and songfile.filename != '':
			old_file_position = songfile.tell()
			songfile.seek(0, os.SEEK_END)
			size = songfile.tell()
			songfile.seek(old_file_position, os.SEEK_SET)

			if size > 10 * 1024 * 1024:
				return jsonResponse('Error', 'Max song size: 10MB', 403)

			if not allowed_file(songfile.filename.lower()):
				return jsonResponse('Error', 'Wrong file format', 403)

			if allowed_file(songfile.filename.lower()):
				songfile.filename = artist + "-" + title
				songfile.save(app.config['UPLOAD_FOLDER'] +'/'+ str(song.id) + '.mp3')

		session.commit()
		session.close()

		return jsonResponse('Success', 'song uploaded', 200)

	except Exception as e:
		print(e)
		return jsonResponse('Error', 'Server Error', 500)


@app.route("/api/song/edit", methods=['PUT'])
def editsong():
	token = getToken()
	songid = getId()
	responses = []
	type = ["title", "artist", "album", "year"]
	error = ""
	notchanged = ""
	changed = ""
	# verify if token and  request are correct and check them in database
	if token is None or token == 1:
		return jsonResponse('Error', 'Server Error', 500)

	user = access(token)
	if user is None:
		return jsonResponse('Error', 'Invalid user', 403)

	if songid is None or songid == "nope":
		return jsonResponse('Error', 'Server Error', 500)

	file = accessSong(songid)
	if file is None:
		return jsonResponse('Error', 'Invalid file id', 403)

	# verify if user token matches song owner token id
	if user.id != file.user_id:
		return jsonResponse('Error', 'You dont own this song', 403)

	try:
		title = request.json['title']

		responses.append(edit_song_value('title', songid, title))
	except Exception as badTitle:
		print(badTitle)
	try:
		artist = request.json['artist']

		responses.append(edit_song_value('artist', songid, artist))

	except Exception as badArtist:
		print(badArtist)
	try:
		album = request.json['album']

		responses.append(edit_song_value('album', songid, album))
	except Exception as badAlbum:
		print(badAlbum)

	try:
		year = request.json['year']

		responses.append(edit_song_value('year', songid, year))
	except Exception as badYear:
		print(badYear)

		'''
		in case of success the index is None, Not changed if the DB as the same value,
		 and 403 forbidden in case of bad input
		'''
	print(responses)
	if all(item == 'Not changed' for item in responses):
		return jsonResponse('Error', 'everything already up-to-date', 403)

	if all(item is None for item in responses):
		return jsonResponse('Success', 'Everything changed', 200)

	if None not in responses and "Not changed" not in responses:
		return jsonResponse('Error', 'Nothing changed bad email, password and name', 403)

	if None not in responses and "Not changed" in responses:
		for i, j in enumerate(responses):
			if j != "Not changed":
				error += " " + type[i]
			else:
				notchanged += " " + type[i]
		return jsonResponse('Error', 'Nothing changed, already up-to-date: ' + notchanged + ' |bad input: ' + error,
							403)

	for i, j in enumerate(responses):
		if j == "Not changed":
			notchanged += " " + type[i]
		elif j is None:
			changed += " " + type[i]
		else:
			error += " " + type[i]
	print("bem: " + notchanged + "mal: " + error)
	return jsonResponse('Success',
						'Changed: ' + changed + ' |already up-to-date: ' + notchanged + ' |bad input: ' + error, 207)


def edit_song_value(type, id, value):
	if value == "" or value is None:
		return jsonResponse('Error', 'Insert a valid input (more than 6 characters and less than 100)', 403)
	try:
		session = create_session()
		song = accessSong(id)
		if type == 'title':
			if song.title == value:
				return "Not changed"
			if len(value) < 6 or len(value) > 100:

				return jsonResponse('Error', 'Insert a valid title (more than 6 characters and less than 100)', 403)
		if type == 'artist':
			if song.artist == value:
				return "Not changed"
			if len(value) < 6 or len(value) > 100:

				return jsonResponse('Error', 'Insert a valid artist (more than 6 characters and less than 100)', 403)
		if type == 'album':
			if song.album == value:
				return "Not changed"
			if len(value) < 6 or len(value) > 100:

				return jsonResponse('Error', 'Insert a valid album (more than 6 characters and less than 100)', 403)

		if type == 'year':
			try:
				value = int(value)
			except (ValueError, TypeError):
				return jsonResponse('Error', 'Invalid year', 403)
			if song.year == value:
				return "Not changed"
			if value < 0 or value > 2017:

				return jsonResponse('Error', 'Insert a valid year 0<y<2018', 403)

		session.query(Song).filter(Song.id == id).update({type: value})
		session.commit()
		session.close()

	except Exception as e:
		return e


@app.route("/api/song/list", methods=['GET'])
def list_songs_from_user():
	try:
		token = request.args.get('token')

		user = access(token)

		if user is None or user == "":
			return jsonResponse('Error', 'Invalid user', 403)

		session = create_session()

		songs = session.query(Song).filter(Song.user_id == user.id).all()

		if songs:
			songs = [song.serialize() for song in songs]

			response_data = {
				'result': 'Success',
				'message': 'Playlist retrieved successfully',
				'songs': songs
			}

			response = jsonify(response_data)
			response.status_code = 200
			session.close()
			return response
		if not songs:
			return jsonResponse('Success', 'Users has no songs', 200)

	except Exception as e:
		print(e)
		return jsonResponse('Error', 'Server Error', 500)


@app.route("/api/song/listall", methods=['GET'])
def list_all_songs():
	try:
		token = request.json['token']
		user = access(token)

		if user is None or user == "":
			return jsonResponse('Error', 'Invalid user', 403)

		session = create_session()

		songs = session.query(Song).all()

		if songs:
			songs = [song.serialize() for song in songs]

			response_data = {
				'result': 'Success',
				'message': 'Playlist retrieved successfully',
				'songs': songs
			}

			response = jsonify(response_data)
			response.status_code = 200
			session.close()
			return response
		if not songs:
			return jsonResponse('Success', 'no songs to show', 200)

	except Exception as e:
		print(e)
		return jsonResponse('Error', 'Server Error', 500)


@app.route("/api/song/search", methods=['GET'])
def search_songs():
	try:
		token = request.json['token']
		keyword = request.json['keyword']
		user = access(token)

		if user is None or user == "":
			return jsonResponse('Error', 'Invalid user', 403)

		session = create_session()
		songsartist = session.query(Song).filter(Song.artist.contains(keyword)).all()
		songstitle = session.query(Song).filter(Song.title.contains(keyword)).all()
		songs = songsartist
		for i in songstitle:
			if i not in songs:
				songs += i

		if songs:
			songs = [song.serialize() for song in songs]

			response_data = {
				'result': 'Success',
				'message': 'Playlist retrieved successfully',
				'songs': songs
			}

			response = jsonify(response_data)
			response.status_code = 200
			session.close()
			return response
		if not songs:
			return jsonResponse('Success', 'no songs to show', 200)

	except Exception as e:
		print(e)
		return jsonResponse('Error', 'Server Error', 500)


@app.route("/api/song/delete", methods=['DELETE'])
def delete_songs():
	token = getToken()
	songid = getId()
	# verify if token and  request are correct and check them in database
	if token is None or token == 1:
		return jsonResponse('Error', 'Server Error', 500)

	user = access(token)
	if user is None:
		return jsonResponse('Error', 'Invalid user', 403)

	file = accessSong(songid)
	if file is None:
		return jsonResponse('Error', 'Invalid file id', 403)

	# verify if user token matches song owner token id
	if user.id != file.user_id:
		return jsonResponse('Error', 'You dont own this song', 403)

	try:
		session = create_session()

		session.query(Song).filter(Song.id == songid).update({'user_id': "1"})
		session.commit()
		session.close()
		return jsonResponse('Sucess', 'Music Deleted', 200)

	except Exception as e:
		print(e)
		return jsonResponse('Error', 'Server Error', 500)


def getId():
	try:
		return request.json['id']
	except Exception:
		return "nope"


# verify id returns song with that id
def accessSong(id):
	session = create_session()
	song = session.query(Song).filter_by(id=id).first()
	session.close()
	return song
