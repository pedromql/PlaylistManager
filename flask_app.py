from flask import Flask, send_from_directory
import json

app = Flask(__name__)

filename = 'data/names.txt'

@app.route('/names')
def get_the_names():
	reply = {}
	with open(filename) as f:
		lines = f.readlines()
		for line in lines:
			print(line)
			name, age = line.split(',')
			reply[name] = age
		return json.dumps(reply)

@app.route('/js/<path:path>')
def send_js(path):
	return send_from_directory('js', path)

@app.route('/')
def root():
	return app.send_static_file('index.html')
