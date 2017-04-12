from flask import *
from api import create_session, app
from create_database import  *

@app.route("/api/playlist/create", methods=['POST'])
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



@app.route("/api/playlist", methods=['PUT'])
def edit_playlist():
	try:

		id = request.json['id']
		token = request.json['token']
		name = request.json['name']

		session = create_session()

		#check if username exists
		user = session.query(User).filter(User.token == token).first()
		playlist = session.query(Playlist).filter(Playlist.id == id).first()
		#if token corresponds create playlist
		if user is not None and playlist is not None:
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

			else:
				session.close()

				response_data = {
					'result' : 'Error',
					'message' : 'Playlist does not belong to the user'
				}

				response = jsonify(response_data)
				response.status_code = 403

				return response
				
		#if user exists return error            
		elif user is None:
			session.close()

			response_data = {
				'result' : 'Error',
				'message' : 'Invalid Token'
			}

			response = jsonify(response_data)
			response.status_code = 401

			return response
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