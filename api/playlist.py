from flask import *
from api import create_session, app
from create_database import  *

@app.route("/api/playlists", methods=['GET'])
def list_playlists():
	try:

		token = request.json['token']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		#if user exists
		if user is not None:
			playlists=[playlist.serialize() for playlist in user.playlists]

			response_data = {
				'result' : 'Success',
				'message' : 'Playlists retrieved successfuly',
				'playlists' : playlists
			}

			response = jsonify(response_data)
			response.status_code = 200
			session.close()
			return response

				
		#if token does not correspond to a user          
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response

	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response	


@app.route("/api/playlist", methods=['DELETE','GET','POST','PUT'])
def playlist():
	if request.method == 'GET':
		return list_playlist_musics()
	elif request.method == 'ṔOST':
		return create_playlist()
	elif request.method == 'PUT':
		return edit_playlist()
	elif request.method == 'DELETE':
		return delete_playlist()
	else:
		pass

def list_playlist_musics():
	try:

		id = request.json['id']
		token = request.json['token']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if both the token and the playlist exist
		if user is not None and playlist is not None:
			#if token corresponds to the playlist creator
			if playlist.user_id == user.id:
				
				print(playlist.songs)
				songs=[song.serialize() for song in playlist.songs]

				response_data = {
					'result' : 'Success',
					'message' : 'Playlist retrieved successfuly',
					'songs' : songs
				}

				response = jsonify(response_data)
				response.status_code = 200
				session.close()
				return response

			#if token does not correspond with the playlist creator
			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if token does not correspond to a user          
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
		#if token is valid but the playlist does not exist
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Playlist does not exist'
			}

			response = jsonify(response_data)
			response.status_code = 403

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response

def create_playlist():
	try:

		name = request.json['name']
		token = request.json['token']

		session = create_session()

		#check if username exists
		user  = session.query(User).filter(User.token == token).first()
		#if token corresponds create playlist
		if user is not None:
			playlist = Playlist(name=name)
			
			user.playlists.append(playlist)

			session.add(playlist)
			session.commit()
			session.close()

			response_data = {
				'result' : 'Success',
				'message' : 'Playlist '+name+' created successfuly'
			}

			response = jsonify(response_data)
			response.status_code = 200

			return response
			
		#if user exists return error            
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response


def edit_playlist():
	try:

		id = request.json['id']
		token = request.json['token']
		name = request.json['name']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if both the token and the playlist exist
		if user is not None and playlist is not None:
			#if token corresponds to the playlist creator
			if playlist.user_id == user.id:
				playlist.name = name
				session.commit()
				session.close()

				response_data = {
					'result' : 'Success',
					'message' : 'Playlist '+name+' changed successfuly'
				}

				response = jsonify(response_data)
				response.status_code = 200

				return response

			#if token does not correspond with the playlist creator
			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if token does not correspond to a user          
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
		#if token is valid but the playlist does not exist
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Playlist does not exist'
			}

			response = jsonify(response_data)
			response.status_code = 403

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response

def delete_playlist():
	try:

		id = request.json['id']
		token = request.json['token']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if both the token and the playlist exist
		if user is not None and playlist is not None:
			#if token corresponds to the playlist creator
			if playlist.user_id == user.id:
				
				session.delete(playlist)
				session.commit()

				response_data = {
					'result' : 'Success',
					'message' : 'Playlist deleted successfuly'
				}

				response = jsonify(response_data)
				response.status_code = 200
				session.close()
				return response

			#if token does not correspond with the playlist creator
			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if token does not correspond to a user          
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
		#if token is valid but the playlist does not exist
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Playlist does not exist'
			}

			response = jsonify(response_data)
			response.status_code = 403

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response

@app.route("/api/playlist/song", methods=['DELETE','POST'])
def playlist_song():
	if request.method == 'DELETE':
		return delete_song_from_playlist()
	elif request.method == 'POST':
		return add_song_to_playlist()
	else:
		pass

def add_song_to_playlist(): #TODO could check if song is already in playlist
	try:

		id = request.json['id']
		songs = request.json['songs']
		token = request.json['token']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if both the token and the playlist exist
		if user is not None and playlist is not None:
			#if token corresponds to the playlist creator
			if playlist.user_id == user.id:
				success = []
				fail = []
				for song_id in songs:
					
					song = session.query(Song).filter(Song.id == song_id).first()
					if song is not None:
						playlist.songs.append(song)
						success.append(song_id)
					else:
						fail.append(song_id)
					
					print(success)
					print(fail)

				session.commit()

				if len(success) > 0 and len(fail) == 0:
					response_data = {
						'result' : 'Success',
						'success' : success,
						'fail' : fail,
						'message' : 'Songs added to playlist'
					}
					response = jsonify(response_data)
					response.status_code = 200
					
				elif len(success) > 0 and len(fail) > 0:
					response_data = {
						'result' : 'Partial Success',
						'success' : success,
						'fail' : fail,
						'message' : 'Some songs added to playlist'
					}
					response = jsonify(response_data)
					response.status_code = 207
					
				else:
					response_data = {
						'result' : 'Error',
						'success' : success,
						'fail' : fail,
						'message' : 'No songs added to playlist'
					}
					response = jsonify(response_data)
					response.status_code = 400

				session.close()
				
				return response

			#if token does not correspond with the playlist creator
			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if token does not correspond to a user          
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
		#if token is valid but the playlist does not exist
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Playlist does not exist'
			}

			response = jsonify(response_data)
			response.status_code = 403

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response


def delete_song_from_playlist():
	try:

		id = request.json['id']
		songs = request.json['songs']
		token = request.json['token']

		session = create_session()

		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if both the token and the playlist exist
		if user is not None and playlist is not None:
			#if token corresponds to the playlist creator
			if playlist.user_id == user.id:
				success = []
				fail = []
				for song_id in songs:
					
					song = session.query(Song).filter(Song.id == song_id).first()
					if song is not None and song in playlist.songs:
						playlist.songs.remove(song)
						success.append(song_id)
					else:
						fail.append(song_id)
					
					print(success)
					print(fail)

				session.commit()

				if len(success) > 0 and len(fail) == 0:
					response_data = {
						'result' : 'Success',
						'success' : success,
						'fail' : fail,
						'message' : 'Songs removed from playlist'
					}
					response = jsonify(response_data)
					response.status_code = 200
					
				elif len(success) > 0 and len(fail) > 0:
					response_data = {
						'result' : 'Partial Success',
						'success' : success,
						'fail' : fail,
						'message' : 'Some songs removed from playlist'
					}
					response = jsonify(response_data)
					response.status_code = 207
					
				else:
					response_data = {
						'result' : 'Error',
						'success' : success,
						'fail' : fail,
						'message' : 'No songs removed from playlist'
					}
					response = jsonify(response_data)
					response.status_code = 400

				session.close()
				
				return response

			#if token does not correspond with the playlist creator
			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if token does not correspond to a user          
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
		#if token is valid but the playlist does not exist
		else:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Playlist does not exist'
			}

			response = jsonify(response_data)
			response.status_code = 403

			return response


	except Exception as e:
		print(e)
		response_data = {
				'result' : 'Error',
				'message' : 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response
