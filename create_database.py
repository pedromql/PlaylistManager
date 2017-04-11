import sqlalchemy
from sqlalchemy import Table, Column, Integer, String, create_engine, Sequence, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

engine = create_engine('mysql+pymysql://root:root@localhost',echo=False)

# Create and select database
engine.execute('CREATE DATABASE IF NOT EXISTS test_playlist_manager')
engine.execute('USE test_playlist_manager')

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
	token = Column(String(100))

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
