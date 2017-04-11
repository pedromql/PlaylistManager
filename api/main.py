from flask import *
from api import create_session, app
from create_database import  *

@app.route('/')
def index():
	return render_template('index.html')
	
@app.route('/setcookie', methods = ['POST', 'GET'])
def setcookie():
	if request.method == 'POST':
		user = request.form['nm']
	
	resp = make_response(render_template('index.html'))
	resp.set_cookie('userID', user)
	
	return resp

@app.route('/getcookie')
def getcookie():
   name = request.cookies.get('userID')
   return '<h1>welcome '+name+'</h1>'