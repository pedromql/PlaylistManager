from flask import *
from api import create_session, app, encrypt, access, getToken, jsonResponse
from create_database import *
import random
import re

sys_random = random.SystemRandom()

@app.route('/')
def index():
	token_cookie = request.cookies.get('token')
	if token_cookie is None:
		return render_template('index.html')
	else:  # check is token is valid
		session = create_session()

		# check if email/password combo
		user = session.query(User).filter(User.token == token_cookie).first()
		if user is not None:
			return '<h1>welcome ' + token_cookie + '</h1><form action="/logout"><input type="submit" value="logout"/></form>'
		else:
			return render_template('index.html')


@app.route('/register', methods=['POST'])
def register():
	try:
		email = request.form['email']
		password = request.form['password']
		name = request.form['name']

		if name is None or len(name) < 6 or len(name) > 100:
			pass #error page

		if not re.match("[^@]+@[^@]+\.[^@]+", email) or len(email) > 80:
			pass #error page

		if password is None or len(password) < 6 or len(password) > 16:
			pass #error page

		password = encrypt(password)
	
		session = create_session()

		# check if username exists
		user = session.query(User).filter(User.email == email).first()
		# if user does not exist add to database and return success
		if user is None:
			token = ''

			while True:
				token = ''.join(
					sys_random.choice('0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM') for _ in
					range(50))
				if session.query(User).filter(User.token == token).first() is None:
					break

			user = User(email=email, password=password, name=name, token=token)
			session.add(user)
			session.commit()
			session.close()

			# set cookie and redirect for main page
			resp = make_response(redirect('/'))
			resp.set_cookie('token', token)

			return resp

		# if user exists return error
		else:
			session.close()
			#return error
			return make_response(redirect('/'))
			

	except Exception as e:
		print(e)
		response_data = {
			'result': 'Error',
			'message': 'Server Error'
		}

		response = jsonify(response_data)
		response.status_code = 500

		return response

@app.route("/login", methods=['POST'])
def login_static():
	try:

		email = request.form['email']
		password = request.form['password']
		password = encrypt(password)

		session = create_session()

		# check if email/password combo
		user = session.query(User).filter(User.email == email, User.password == password).first()

		# if username/password combo is correct return success with token
		if user is not None:

			token = user.token
			name = user.name

			session.close()

			resp = make_response(redirect("/"))
			resp.set_cookie('token', token)

			return resp

		# if username/password combo is incorrect return error
		# TODO check if email even exists
		else:
			return make_response(redirect("/"))


	except Exception as e:
		print(e)
		return make_response(redirect("/"))


@app.route('/logout')
def logout():
	resp = make_response(redirect('/'))
	resp.set_cookie('token', '', expires=0)
	return resp
