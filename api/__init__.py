from sqlalchemy import *
from sqlalchemy.orm import *
from create_database import *
from flask import *
import hashlib


user_password = "mysqldbfores:mysqldbforescrazyguy5436434"

application = app = Flask(__name__)

UPLOAD_FOLDER = '/uploads/Music'
ALLOWED_EXTENSIONS = set(['mp3'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def create_session():
    Base = declarative_base()
    engine = create_engine('mysql+pymysql://' + user_password + '@aaa78l314k1f4e.clqnkfbup002.us-west-2.rds.amazonaws.com:3306/test_playlist_manager')
    Session = sessionmaker(bind=engine)
    session = Session()
    return session


def access(token):
    session = create_session()
    user = session.query(User).filter_by(token=token).first()
    session.close()
    return user


def encrypt(password):
    m = hashlib.md5()
    m.update(password.encode('utf-8'))
    return m.hexdigest()


def getToken():
    try:
        return request.json['token']
    except Exception as e:
        return 1


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def verifyJsonValue(value, min, max):
    if value is None or value == "" or len(value) < min or len(value) > max:
        return 1
    else:
        return 0


def jsonResponse(result, message, code):
    response_data = {
        'result': result,
        'message': message
    }

    response = jsonify(response_data)
    response.status_code = code

    return response


import api.user
import api.playlist
import api.main
import api.song
