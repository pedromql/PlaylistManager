from sqlalchemy import *
from sqlalchemy.orm import *
from create_database import *
from flask import *
import hashlib


user_password = "root:root"

application = app = Flask(__name__)


def create_session():
    Base = declarative_base()
    engine = create_engine('mysql+pymysql://' + user_password + '@localhost:3306/test_playlist_manager')
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


import api.user
import api.playlist
import api.main
