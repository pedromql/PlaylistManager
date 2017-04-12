from flask import *
from api import create_session, app, encrypt, access, getToken
from create_database import  *
import os, sys, random
import re

sys_random = random.SystemRandom()

@app.route("/api/user/create", methods=['POST'])
def create():
    try:

        email = request.json['email']
        password = request.json['password']
        name = request.json['name']

        if name is None or len(name) < 6 or len(name)>100:
            response_data = {
                'result': 'Error',
                'message': 'Insert a valid name (more than 6 characters and less than 100)'
            }

            response = jsonify(response_data)
            response.status_code = 403

            return response

        if not re.match("[^@]+@[^@]+\.[^@]+", email) or len(email) > 80:
            response_data = {
                'result': 'Error',
                'message': 'Insert a valid email'
            }

            response = jsonify(response_data)
            response.status_code = 403

            return response

        if password is None or len(password) < 6 or len(password)>16:
            response_data = {
                'result': 'Error',
                'message': 'Insert a valid password (more than 6 characters and less than 16)'
            }

            response = jsonify(response_data)
            response.status_code = 403

            return response



        password = encrypt(password)

        session = create_session()

        #check if username exists
        user  = session.query(User).filter(User.email == email).first()
        #if user does not exist add to database and return success
        if user is None:
            token = ''

            while True:
                token = ''.join(sys_random.choice('0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM') for _ in range(50))
                if session.query(User).filter(User.token == token).first() is None:
                    break

            user = User(email=email, password=password, name=name, token=token)
            session.add(user)
            session.commit()
            session.close()

            response_data = {
                'result' : 'Success',
                'message' : 'User '+ name +' created successfuly'
            }

            response = jsonify(response_data)
            response.status_code = 200

            return response
            
        #if user exists return error            
        else:
            session.close()

            response_data = {
                'result' : 'Error',
                'message' : 'User '+ name +' already exists'
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



@app.route("/api/user/edit", methods=['PUT'])
def edit():
    token = getToken()
    responses = []
    if token is None or token==1:
        response_data = {
            'result': 'Error',
            'message': 'Server Error'
        }

        response = jsonify(response_data)
        response.status_code = 500

        return response
    try:
        email = request.json['email']
        responses.append(edit_value('email',token,email))
    except Exception as badEmail:
        print(badEmail)
    try:
        password = request.json['password']
        responses.append( edit_value('password',token,password) )
    except Exception as badPassword:
        print(badPassword)
    try:
        name = request.json['name']
        responses.append( edit_value('name',token,name) )
        '''
        in case of success the index is None, Not changed if the DB as the same value, and 403 forbidden in case of bad input
        '''
        #print(responses)
        #TODO if to change the response 
        response_data = {
            'result': 'Success',
            'message': 'User updated successfuly'
        }

        response = jsonify(response_data)
        response.status_code = 200

        return response
    except Exception as badName:
        print(badName)

def edit_value(type, token, value):
    if (value == "" or value is None):
        return
    try:
        session = create_session()
        user = access(token)


        if (type == 'email'):
            if(user.email == value):
                return "Not changed"
            if not re.match("[^@]+@[^@]+\.[^@]+", value) or len(value) > 80:
                response_data = {
                    'result': 'Error',
                    'message': 'Insert a valid email'
                }

                response = jsonify(response_data)
                response.status_code = 403

                return response

            session.query(User).filter(User.token == token).update({"email": (value)})
            session.commit()
        elif(type == 'name'):
            if (user.name == value):
                return "Not changed"
            if len(value) < 6 or len(value) > 100:
                response_data = {
                    'result': 'Error',
                    'message': 'Insert a valid name (more than 6 characters and less than 100)'
                }

                response = jsonify(response_data)
                response.status_code = 403

                return response

            session.query(User).filter(User.token == token).update({"name": (value)})
            session.commit()

        elif(type == 'password'):
            if (user.password == encrypt(value)):
                return "Not changed"
            if len(value) < 6 or len(value) > 16:
                response_data = {
                    'result': 'Error',
                    'message': 'Insert a valid password (more than 6 characters and less than 16)'
                }

                response = jsonify(response_data)
                response.status_code = 403

                return response

            password = encrypt(value)

            session.query(User).filter(User.token == token).update({"password": (password)})
            session.commit()

        session.close()

    except Exception as e:
        return e



@app.route("/api/user/login", methods=['POST'])
def login():
    try:

        email = request.json['email']
        password = request.json['password']
        name  = request.json['name']

        session = create_session()

        #check if username/password combo
        user  = session.query(User).filter(User.email == email, User.password == password).first()
        
        #if username/password combo is correct return success with token
        if user is not None:

            token = user.token
            
            session.close()

            response_data = {
                'result' : 'Success',
                'message' : 'User '+ name +' logged in successfully',
                'token' : token,
                'name' : name
            }

            response = jsonify(response_data)
            response.status_code = 200

            return response

        #if username/password combo is incorrect return error
        #TODO check if email even exists
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
