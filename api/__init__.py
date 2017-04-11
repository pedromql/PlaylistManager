from sqlalchemy import *
from sqlalchemy.orm import *
from create_database import *
from flask import *


user_password = "root:root"

application = app = Flask(__name__)


def create_session():
    Base = declarative_base()
    engine = create_engine('mysql+pymysql://' + user_password + '@localhost:3306')
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

def access(token):
    session = create_session()
    user = session.query(User).filter_by(token=token).first()
    session.close()
    return user




import api.user
