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