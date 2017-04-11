from flask import *
from api import create_session, app
from create_database import  *

@app.route("/api/user/create", methods=['POST'])
def create():
    try:
        json_dict = request.get_json()

        #token = json_dict['token']

        #user = access(token)

        #if token is None:
        #    return jsonify(success=False, result="User doesn't exist")

        session = create_session()

        user = User(username=json_dict['username'], password = json_dict['password'], name=json_dict['name'])

        session.add(user)

        session.close()

        return jsonify(success=True, result="User "+json_dict['username']+" created successfully")
    except Exception as e:
        return jsonify(success=False, result=e)
