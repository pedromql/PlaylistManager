from flask import *
from api import create_session, app
from create_database import  *
import os, sys, random

sys_random = random.SystemRandom()

@app.route("/api/user/create", methods=['POST'])
def create():
    try:

        username = request.json['username']
        password = request.json['password']
        name = request.json['name']

        session = create_session()

        #check if username exists
        user  = session.query(User).filter(User.username == username).first()
        #if user does not exist add to database and return success
        if user is None:
            token = ''

            while True:
                token = ''.join(sys_random.choice('0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM') for _ in range(50))
                if session.query(User).filter(User.token == token).first() is None:
                    break

            user = User(username=username, password=password, name=name, token=token)
            session.add(user)
            session.commit()
            session.close()

            response_data = {
                'result' : 'Success',
                'message' : 'User '+username+' created successfuly'
            }

            response = jsonify(response_data)
            response.status_code = 200

            return response
            
        #if user exists return error            
        else:
            session.close()

            response_data = {
                'result' : 'Error',
                'message' : 'User '+username+' already exists'
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




@app.route("/api/user/login", methods=['POST'])
def login():
    try:

        username = request.json['username']
        password = request.json['password']

        session = create_session()

        #check if username/password combo
        user  = session.query(User).filter(User.username == username, User.password == password).first()
        
        #if username/password combo is correct return success with token
        if user is not None:

            token = user.token
            
            session.close()

            response_data = {
                'result' : 'Success',
                'message' : 'User '+username+' logged in successfully',
                'token' : token
            }

            response = jsonify(response_data)
            response.status_code = 200

            return response

        #if username/password combo is incorrect return error
        #TODO check if username even exists
        else:
            
            session.close()

            response_data = {
                'result' : 'Error',
                'message' : 'Login failed'
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
