import sqlalchemy
from sqlalchemy import Table, Column, Integer, String, create_engine, Sequence, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

engine = create_engine('mysql+pymysql://root:root@localhost',echo=False)

# Create and select database
engine.execute('CREATE DATABASE IF NOT EXISTS test_playlist_manager')
engine.execute('USE test_playlist_manager')

# Clear old data
#engine.execute('DROP TABLE IF EXISTS doctors')
#engine.execute('DROP TABLE IF EXISTS patients')
#engine.execute('DROP TABLE IF EXISTS patient_doctor')

Base = declarative_base()

playlists_songs = Table('playlists_songs', Base.metadata, 
						Column('playlist_id', Integer, ForeignKey('playlist.id')),
						Column('song_id', Integer, ForeignKey('song.id'))
						)

class User(Base):
	__tablename__ = 'user'
	id = Column(Integer, primary_key=True)
	username = Column(String(40))
	password = Column(String(40))
	name = Column(String(100))

	#TODO 
	#DONE user has songs, user has playlists

	def __repr__(self):
		return "<User(name='%s', username='%s', password='%s', id='%s'>" % (self.name, self.username, self.password, self.id)

class Playlist(Base):
	__tablename__ = 'playlist'
	id = Column(Integer, primary_key=True)
	name = Column(String(100))

	user_id = Column(Integer, ForeignKey('user.id'))
	user = relationship("User", back_populates="playlists")

	# many to many Playlist<->Song
	songs = relationship('Song', 
		secondary=playlists_songs,
		back_populates='playlists')

	#TODO 
	#DONE can have one User(creator), playlist has songs

	def __repr__(self):
		return "<Playlist(name='%s', id='%s'>" % (self.name, self.id)

class Song(Base):
	__tablename__ = 'song'
	id = Column(Integer, primary_key=True)
	title = Column(String(100))
	artist = Column(String(100))
	album = Column(String(100))
	year = Column(Integer)
	path = Column(String(200))

	user_id = Column(Integer, ForeignKey('user.id'))
	user = relationship("User", back_populates="songs")

	# many to many Playlist<->Song
	playlists = relationship('Playlist',
		secondary=playlists_songs,
		back_populates='songs')

	#TODO
	#DONE can have one User(uploader), can belong to several playlists

	def __repr__(self):
		return "<Song(title='%s', artist='%s', album='%s', year='%s', path='%s', id='%s'>" % (self.title, self.artist, self.album, self.year, self.path, self.id)


User.songs = relationship("Song", order_by=Song.id, back_populates="user")

User.playlists = relationship("Playlist", order_by=Playlist.id, back_populates="user")


Base.metadata.create_all(engine)

user1 = User(username='pedromql', password='arrozdecona', name='Pedro Quiterio')
user2 = User(username='filipes', password='arrozdecona', name='Filipe Sequeira')

song1 = Song(title='Fire', artist='Ed Sheeran', album='X', year=2014, path=None)
song2 = Song(title='Boys', artist='The Beatles', album='Please Please Me', year=1963, path=None)
song3 = Song(title='Miolo', artist='Miolo', album='Miolo', year=2000, path=None)
song4 = Song(title='Back To the Future', artist='Seth', album='Back back back', year=2017, path=None)

playlist1 = Playlist(name='playlist de merda')
playlist2 = Playlist(name='vida puta cagalhoes')


user1.songs = [song1, song2]
user2.songs = [song3, song4]

user1.playlists = [playlist1, playlist2]

playlist1.songs = [song1, song3]
playlist2.songs = [song1, song2, song3, song4]

Session =  sessionmaker(bind=engine)
session = Session()

session.add_all([user1, user2])
session.add_all([song1, song2, song3, song4])
session.add_all([playlist1, playlist2])
session.commit()

all_users = session.query(User).order_by(User.id)

for user in all_users:
	print(user)
	print("Songs:")
	for song in user.songs:
		print(song)
	print("\n")
	print("Playlists:")
	for playlist in user.playlists:
		print(playlist)
		for song in playlist.songs:
			print(song)
