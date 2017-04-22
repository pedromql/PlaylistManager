/*** @jsx React.DOM */

function createCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

var realPython = React.createClass({
	render: function() {
		return (<h2>Greetings, from Real Python!</h2>);
	}
});

class AddSong extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: "",
			artist: "",
			album: "",
			year: "",
			file: ""
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		

		const target = event.target;
		const name = target.name;

		this.setState({
			[name]: target.value
		});
	}

	handleSubmit(event) {
		var data = new FormData();
		data.append('title', this.state.title);
		data.append('artist', this.state.artist);
		data.append('album', this.state.album);
		data.append('year', this.state.year);
		data.append('token', readCookie('token'));
		data.append('file', document.getElementById('file').files[0]);
		var config = {
			onUploadProgress: function(progressEvent) {
				var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
			},
			headers: {'Content-Type': 'multipart/form-data'}
		};
		axios.post('/api/song/create', data, config)
		.then(response => {
			swal({
				title: "Song uploaded!",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.setState({
				title: "",
				artist: "",
				album: "",
				year: ""
			});
			$("#file").val('');
		})
		.catch(function (error) {
			swal({
				title: "Upload failed!",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	render() {
		return (
			<div><h2>Add Song</h2>
			<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
			<label>
			Title:
			<input className="form-control" type="text" name="title" value={this.state.title} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Artist:
			<input className="form-control" type="text" name="artist" value={this.state.artist} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Album:
			<input className="form-control" type="text" name="album" value={this.state.album} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Year:
			<input className="form-control" type="text" name="year" value={this.state.year} onChange={this.handleChange}/>
			</label><br/>
			<label>
			File:
			<input className="form-control" type="file" name="file" id="file"/>
			</label><br/>
			<input type="submit" className="templatemo-blue-button" value="Create"/>
			</form>
			</div>
			);
	}

}

class CreatePlaylist extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: ""
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.setState({name: event.target.value});
	}

	handleSubmit(event) {
		
		axios.post('/api/playlist', {
			token: readCookie('token'),
			name: this.state.name
		})
		.then(response => {
			swal({
				title: "Playlist created!",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.setState({name: ""});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Playlist creation failed.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	render() {
		return (
			<div><h2>Create Playlist</h2>
			<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
			<label>
			Playlist name:
			<input className="form-control" type="text" value={this.state.name} onChange={this.handleChange}/>
			</label>
			<input type="submit" className="templatemo-blue-button" value="Create"/>
			</form>
			</div>
			);
	}

}

class AllSong extends React.Component {
	constructor(props) {
		super(props);
		
		if (props.playlists.length > 0) {
			this.state = {
				playlists: props.playlists,
				value: props.playlists[0].props.value
			};
		}
		else {
			this.state = {
				playlists: props.playlists,
				value: ""
			};
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.play = this.play.bind(this);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		
		var songs = [];
		songs.push(this.props.song.id);
		axios.post('/api/playlist/song', {
			token: readCookie('token'),
			id: this.state.value,
			songs: songs
		})
		.then(response => {
			swal({
				title: "Added to playlist.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Add to playlist failed.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	play(event) {
		player.setState({
			id: this.props.song.id,
			title: this.props.song.title,
			artist: this.props.song.artist,
			album: this.props.song.album,
			year: this.props.song.year,
			src: "/api/song/play?token="+readCookie('token')+"&songid="+this.props.song.id+""
		})
	}

	render() {
		return (
			<tr key={this.props.song.id}>
			<td>{this.props.song.title}</td>
			<td>{this.props.song.artist}</td>
			<td>{this.props.song.album}</td>
			<td>{this.props.song.year}</td>
			<td>
			<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
			<select className="form-control" value={this.state.value} onChange={this.handleChange}>
			{this.state.playlists}
			</select>
			<input className="templatemo-blue-button" type="submit" value="Add to playlist"/>
			</form>
			</td>
			<td>
			<button className="templatemo-blue-button" onClick={this.play}>Play Song</button>
			</td>
			</tr>
			);
	}
}


class AllSongs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			songs: null,
			playlists: null
		};
	}

	componentDidMount() {

		axios.get('/api/song/listall', {
			params: {
				token: readCookie('token')
			}
		})
		.then(response => {
			var songs = [];
			var playlists = [];
			axios.get('/api/playlists', {
				params: {
					token: readCookie('token')
				}
			})
			.then(response2 => {
				response2.data.playlists.forEach((playlist) => {
					playlists.push(<option value={playlist.id}>{playlist.name}</option>)
				});
				if (response.data.songs != null) {
					response.data.songs.forEach((song) => {
						songs.push(<AllSong song={song} playlists={playlists} key={song.id} value={song.id} onClick={() => this.delete(song.id)} />);
						
					});
				}
				
				this.setState({playlists});
				this.setState({ songs });
				this.forceUpdate();
			});
		});

	}
	render() {
		if (this.state.songs != null) {
			if (this.state.songs.length > 0) {
				return (
					<div className="panel panel-default templatemo-content-widget white-bg no-padding templatemo-overflow-hidden">
					<div className="panel-heading templatemo-position-relative"><h2>All Music</h2></div>
					<div className="table-responsive">
					<table className="table table-striped table-bordered">
					<thead>
					<tr>
					<th>Name</th>
					<th>Artist</th>
					<th>Album</th>
					<th>Year</th>
					<th></th>
					<th></th>
					</tr>
					</thead>
					<tbody>{this.state.songs}</tbody>
					</table>
					</div>
					</div>
					);
			}
			else {
				return(
					<div>
					<h2>All Music</h2>
					<li>No songs added yet.</li>
					</div>
					);
			}
		}
		else {
			return(
				<div>
				<h2>All Music</h2>
				<li>Loading...</li>
				</div>
				);
		}

	}
}

class MySong extends React.Component {
	constructor(props) {
		super(props);
		
		if (props.playlists.length > 0) {
			this.state = {
				id: props.song.id,
				playlists: props.playlists,
				value: props.playlists[0].props.value,
				title: [props.song.title, props.song.title],
				artist: [props.song.artist, props.song.artist],
				album: [props.song.album, props.song.album],
				year: [props.song.year, props.song.year],
				editable: "false"
			};
		}
		else {
			this.state = {
				id: props.song.id,
				playlists: props.playlists,
				value: "",
				title: [props.song.title, props.song.title],
				artist: [props.song.artist, props.song.artist],
				album: [props.song.album, props.song.album],
				year: [props.song.year, props.song.year],
				editable: "false"
			};
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeEdit = this.handleChangeEdit.bind(this);
		this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
		this.play = this.play.bind(this);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		
		var songs = [];
		songs.push(this.props.song.id);
		axios.post('/api/playlist/song', {
			token: readCookie('token'),
			id: this.state.value,
			songs: songs
		})
		.then(response => {
			swal({
				title: "Added to playlist.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Add to playlist failed.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	handleChangeEdit(event) {
		const target = event.target;
		const name = target.name;
		const original = this.state[name][1]
		

		this.setState({
			[name]: [target.value, original]
		});
	}

	handleSubmitEdit(event) {
		
		var songs = [];
		songs.push(this.props.song.id);
		axios.put('/api/song/edit', {
			token: readCookie('token'),
			id: this.state.id,
			title: this.state.title[0],
			artist: this.state.artist[0],
			album: this.state.album[0],
			year: this.state.year[0]
		})
		.then(response => {
			swal({
				title: "Song edited.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});

			this.setState({
				editable: "false",
				title: [this.state.title[0],this.state.title[0]],
				artist: [this.state.artist[0],this.state.artist[0]],
				album: [this.state.album[0],this.state.album[0]],
				year: [this.state.year[0],this.state.year[0]]
			});
		})
		.catch(error => {
			swal({
				title: "Failed to edit.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	onEdit() {
		(this.state.editable == "false") ? this.setState({editable: "true"}) : this.setState({
			editable: "false",
			title: [this.state.title[1],this.state.title[1]],
			artist: [this.state.artist[1],this.state.artist[1]],
			album: [this.state.album[1],this.state.album[1]],
			year: [this.state.year[1],this.state.year[1]]
		});
	}

	play(event) {
		player.setState({
			id: this.props.song.id,
			title: this.state.title[0],
			artist: this.state.artist[0],
			album: this.state.album[0],
			year: this.state.year[0],
			src: "/api/song/play?token="+readCookie('token')+"&songid="+this.props.song.id+""
		})
	}

	render() {
		if (this.state.editable == "false") {
			return (
				<tr key={this.props.song.id}>
				<td>{this.state.title[0]}</td>
				<td>{this.state.artist[0]}</td>
				<td>{this.state.album[0]}</td>
				<td>{this.state.year[0]}</td>
				<td><button className="templatemo-blue-button" onClick={() => this.props.onClick()}>Delete</button></td>
				<td><button className="templatemo-blue-button" onClick={() => this.onEdit()}>Edit</button></td>
				<td>
				<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
				<select className="form-control" value={this.state.value} onChange={this.handleChange}>
				{this.state.playlists}
				</select>
				<input className="templatemo-blue-button" type="submit" value="Add to playlist"/>
				</form>
				</td>
				<td><button className="templatemo-blue-button" onClick={this.play}>Play Song</button></td>
				</tr>
				);
		}
		else {
			return (
				<tr key={this.props.song.id}>
				<form onSubmit={this.handleSubmitEdit}>
				<td>
				<input type="text" name="title" value={this.state.title[0]} onChange={this.handleChangeEdit}/>
				</td>
				<td>
				<input type="text" name="artist" value={this.state.artist[0]} onChange={this.handleChangeEdit}/>
				</td>
				<td>
				<input type="text" name="album" value={this.state.album[0]} onChange={this.handleChangeEdit}/>
				</td>
				<td>
				<input type="text" name="year" value={this.state.year[0]} onChange={this.handleChangeEdit}/>
				</td>
				<input type="submit" hidden/></form>
				<td><button className="templatemo-blue-button" onClick={() => this.props.onClick()}>Delete</button></td>
				<td><button className="templatemo-blue-button" onClick={() => this.onEdit()}>Cancel Edit</button></td>
				<td>
				<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
				<select className="form-control" value={this.state.value} onChange={this.handleChange}>
				{this.state.playlists}
				</select>
				<input className="templatemo-blue-button" type="submit" value="Add to playlist"/>
				</form>
				</td>
				<td><button className="templatemo-blue-button" onClick={this.play}>Play Song</button></td>
				</tr>
				);
		}
	}
}

class Song extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			playlists: props.playlists,
			value: props.playlists[0].props.value
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.play = this.play.bind(this);
	}
	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		
		var songs = [];
		songs.push(this.props.song.id);
		axios.post('/api/playlist/song', {
			token: readCookie('token'),
			id: this.state.value,
			songs: songs
		})
		.then(response => {
			swal({
				title: "Added to playlist.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Add to playlist failed.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	play(event) {
		player.setState({
			id: this.props.song.id,
			title: this.props.song.title,
			artist: this.props.song.artist,
			album: this.props.song.album,
			year: this.props.song.year,
			src: "/api/song/play?token="+readCookie('token')+"&songid="+this.props.song.id+""
		})
	}

	render() {
		return (
			<tr key={this.props.song.id}>
			<td>{this.props.song.title}</td>
			<td>{this.props.song.artist}</td>
			<td>{this.props.song.album}</td>
			<td>{this.props.song.year}</td>
			<td><button className="templatemo-blue-button" onClick={() => this.props.onClick()}>Delete</button></td>
			<td>
			<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
			<select className="form-control" value={this.state.value} onChange={this.handleChange}>
			{this.state.playlists}
			</select>
			<input className="templatemo-blue-button" type="submit" value="Add to playlist"/>
			</form>
			</td>
			<td><button className="templatemo-blue-button" onClick={this.play}>Play Song</button></td>
			</tr>
			);
	}
}

class Songs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			songs: null
		};
	}

	delete(key) {
		if (this.props.playlist == null) {
			var songs = this.state.songs;
			for (var i = 0; i < songs.length; i++) {
				if (songs[i].key == key) {
					axios.delete('/api/song/delete', {
						params: {
							token: readCookie('token'),
							id: key
						}
					})
					.then(response => {
						swal({
							title: "Song deleted.",
							type: "success",
							timer: 2000,
							showConfirmButton: true
						});
						songs.splice(i, 1);
						this.setState({songs})
					})
					.catch(error => {
						swal({
							title: "Failed to delete song.",
							text: error.response.data.message,
							type: "error",
							timer: 2000,
							showConfirmButton: true
						});
					});

					break;
				}
			}
		}
		else {
			var songs = this.state.songs;
			var playlist = this.props.playlist;
			for (var i = 0; i < songs.length; i++) {
				if (songs[i].key == key) {
					axios.delete('/api/playlist/song', {
						params: {
							token: readCookie('token'),
							id: playlist.id,
							song: key
						}
					})
					.then(response => {
						swal({
							title: "Removed from playlist.",
							type: "success",
							timer: 2000,
							showConfirmButton: true
						});
						songs.splice(i, 1);
						this.setState({songs})

					})
					.catch(error => {
						swal({
							title: "Failed to remove from playlist.",
							text: error.response.data.message,
							type: "error",
							timer: 2000,
							showConfirmButton: true
						});
					});

					break;
				}
			}
		}
	}

	componentDidMount() {
		if (this.props.playlist == null) {

			axios.get('/api/song/list', {
				params: {
					token: readCookie('token')
				}
			})
			.then(response => {
				var songs = [];
				var playlists = [];
				axios.get('/api/playlists', {
					params: {
						token: readCookie('token')
					}
				})
				.then(response2 => {
					response2.data.playlists.forEach((playlist) => {
						playlists.push(<option value={playlist.id}>{playlist.name}</option>)
					});
					if (response.data.songs != null) {
						response.data.songs.forEach((song) => {
							songs.push(<MySong playlists={playlists} song={song} key={song.id} value={song.id} onClick={() => this.delete(song.id)} />);
							
						});
					}
					
					this.setState({playlists});
					this.setState({ songs });
					this.forceUpdate();
				});

			});
		}
		else {
			var playlist_id = this.props.playlist.id;

			axios.get('/api/playlist', {
				params: {
					token: readCookie('token'),
					id: playlist_id
				}
			})
			.then(response => {
				var songs = [];
				var playlists = [];
				axios.get('/api/playlists', {
					params: {
						token: readCookie('token')
					}
				})
				.then(response2 => {
					response2.data.playlists.forEach((playlist) => {
						playlists.push(<option value={playlist.id}>{playlist.name}</option>)
					});
					if (response.data.songs != null) {
						response.data.songs.forEach((song) => {
							songs.push(<Song playlists={playlists} song={song} key={song.id} value={song.id} onClick={() => this.delete(song.id)} />);
							
						});
					}
					
					this.setState({playlists});
					this.setState({ songs });
					this.forceUpdate();
				});

			});
		}
	}

	render() {
		if (this.props.playlist == null) {
			if (this.state.songs != null) {
				if (this.state.songs.length > 0) {
					return (
						<div className="panel panel-default templatemo-content-widget white-bg no-padding templatemo-overflow-hidden">
						<div className="panel-heading templatemo-position-relative"><h2>My Songs</h2></div>
						<div className="table-responsive">
						<table className="table table-striped table-bordered">
						<thead>
						<tr>
						<th>Title</th>
						<th>Artist</th>
						<th>Album</th>
						<th>Year</th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						</tr>
						</thead>
						<tbody>{this.state.songs}</tbody>
						</table>
						</div>
						</div>
						);
				}
				else {
					return(
						<div>
						<h2>My Songs</h2>
						<li>No songs added yet.</li>
						</div>
						);
				}
			}
			else {
				return(
					<div>
					<h2>My Songs</h2>
					<li>Loading...</li>
					</div>
					);
			}
		}
		else {
			if (this.state.songs != null) {
				if (this.state.songs.length > 0) {
					return (
						<div className="panel panel-default templatemo-content-widget white-bg no-padding templatemo-overflow-hidden">
						<div className="panel-heading templatemo-position-relative"><h2>{this.props.playlist.name}</h2></div>
						<div className="table-responsive">
						<table className="table table-striped table-bordered">
						<thead>
						<tr>
						<th>Title</th>
						<th>Artist</th>
						<th>Album</th>
						<th>Year</th>
						<th></th>
						<th></th>
						<th></th>
						</tr>
						</thead>
						<tbody>{this.state.songs}</tbody>
						</table>
						</div>
						</div>
						);
				}
				else {
					return(
						<div>
						<h2>{this.props.playlist.name}</h2>
						<li>No songs added yet.</li>
						</div>
						);
				}
			}
			else {
				return(
					<div>
					<h2>{this.props.playlist.name}</h2>
					<li>Loading...</li>
					</div>
					);
			}
		}
	}
}


class Playlist extends React.Component {
	constructor(props) {
		super(props);
		this.props.playlist.original = this.props.playlist.name;
		this.state = {name: props.playlist.name};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.props.playlist.name = event.target.value;
		this.setState({name: event.target.value});
		
	}

	handleSubmit(event) {
		axios.put('/api/playlist', {
			token: readCookie('token'),
			id: this.props.playlist.id,
			name: this.props.playlist.name
		})
		.then(response => {
			swal({
				title: "Playlist name changed",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});

			this.props.playlist.original = this.props.playlist.name;
			delete this.props.editable;
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Failed to change playlist name.",
				text: error.response.data.message,
				type: "error",
				timer: 3000,
				showConfirmButton: true
			});

		});
		event.preventDefault();
	}

	render() {
		if (this.props.editable != "true") {
			return (
				<tr key={this.props.playlist.id}>
				<td>{this.props.playlist.name}</td>
				<td>{this.props.playlist.size}</td>
				<td>{this.props.playlist.date}</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onClick()}>Delete</button>
				</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onUpdate()}>Modify playlist</button>
				</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onShow()}>View playlist</button>
				</td>
				</tr>
				);
		}
		else {
			return (
				<tr key={this.props.playlist.id}>
				<td>
				<form className="templatemo-login-form" onSubmit={this.handleSubmit}>
				<input className="form-control" type="text" value={this.props.playlist.name} onChange={this.handleChange}/>
				<input type="submit" hidden/>
				</form>
				</td>
				<td>{this.props.playlist.size}</td>
				<td>{this.props.playlist.date}</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onClick()}>Delete</button>
				</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onUpdate()}>Cancel modification</button>
				</td>
				<td>
				<button className="templatemo-blue-button" onClick={() => this.props.onShow()}>View playlist</button>
				</td>
				</tr>
				);
		}
	}
}

class Playlists extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playlists: null,
			name: 0,
			size: 0,
			date: 0
		};
	}

	delete(key) {
		var playlists = this.state.playlists;
		for (var i = 0; i < playlists.length; i++) {
			if (playlists[i].key == key) {
				axios.delete('/api/playlist', {
					params: {
						token: readCookie('token'),
						id: key
					}
				})
				.then(response => {
					swal({
						title: "Playlist deleted.",
						type: "success",
						timer: 2000,
						showConfirmButton: true
					});
					playlists.splice(i, 1);
					this.setState({playlists})
				})
				.catch(error => {
					swal({
						title: "Failed to delete playlist.",
						text: error.response.data.message,
						type: "error",
						timer: 2000,
						showConfirmButton: true
					});
					
				});

				break;
			}
		}
	}

	sort(which) {
		var playlists = this.state.playlists;
		if (this.state[which] == 0) {
			playlists.sort(function(a,b) {
				
				return (a.props.playlist[which] < b.props.playlist[which]) ? 1 : ((b.props.playlist[which] > a.props.playlist[which]) ? -1 : 0);
			});
		}
		else {
			playlists.sort(function(a,b) {
				
				return (a.props.playlist[which] > b.props.playlist[which]) ? 1 : ((b.props.playlist[which] > a.props.playlist[which]) ? -1 : 0);
			});
		}
		this.setState({ playlists }); 

		if (which == "name") {
			(this.state.name == 1) ? this.setState({ name:0}) : this.setState({ name:1});
		}
		else if (which == "size") {
			(this.state.size == 1) ? this.setState({ size:0}) : this.setState({ size:1});
		}
		else {
			(this.state.date == 1) ? this.setState({ date:0}) : this.setState({ date:1});
		}
	}

	show(key) {

	}

	update(key) {
		var playlists = this.state.playlists;
		for (var i = 0; i < playlists.length; i++) {
			if (playlists[i].key == key) {
				var playlist = playlists[i].props.playlist;
				playlist.name = playlist.original;
				if (playlists[i].props.editable != "true") {
					playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} editable="true" onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} onShow={() => this.props.show(playlist)} />
				}
				else {
					playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} onShow={() => this.props.show(playlist)} />
				}
				this.setState({playlists});
				break;
			}
		}
	}

	componentDidMount() {
		axios.get('/api/playlists', {
			params: {
				token: readCookie('token')
			}
		})
		.then(response => {
			var playlists = [];
			if (response.data.playlists != null) {
				
				response.data.playlists.forEach((playlist) => {
					playlists.push(<Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onShow={() => this.props.show(playlist)}/>);
					
				});
				

			}
			this.setState({ playlists });
		});
	}
	render() {

		if (this.state.playlists != null) {
			if (this.state.playlists.length > 0) {
				return (
					<div className="panel panel-default templatemo-content-widget white-bg no-padding templatemo-overflow-hidden">
					<div className="panel-heading templatemo-position-relative"><h2>My Playlists</h2></div>
					<div className="table-responsive">
					<table className="table table-striped table-bordered">
					<thead>
					<tr>
					<th onClick={() => this.sort("name")}><i className="fa fa-sort fa-fw"></i>Name</th>
					<th onClick={() => this.sort("size")}><i className="fa fa-sort fa-fw"></i>Size</th>
					<th onClick={() => this.sort("date")}><i className="fa fa-sort fa-fw"></i>Date</th>
					<th></th>
					<th></th>
					<th></th>
					</tr>
					</thead>
					<tbody>{this.state.playlists}</tbody>
					</table>
					</div>
					</div>
					);
			}
			else {
				return(
					<li>No playlists added yet.</li>
					);
			}
		}
		else {
			return(
				<li>Loading...</li>
				);
		}
	}
}

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: props.keyword,
			songs: null,
			playlists: ""
		};
	}

	componentDidMount() {

		axios.get('/api/song/search', {
			params: {
				token: readCookie('token'),
				keyword: this.state.keyword

			}
		})
		.then(response => {
			var songs = [];
			var playlists = [];
			axios.get('/api/playlists', {
				params: {
					token: readCookie('token')
				}
			})
			.then(response2 => {
				response2.data.playlists.forEach((playlist) => {
					playlists.push(<option value={playlist.id}>{playlist.name}</option>)
				});
				if (response.data.songs != null) {
					response.data.songs.forEach((song) => {
						songs.push(<AllSong song={song} playlists={playlists} key={song.id} value={song.id} />);
					});
				}
				
				this.setState({playlists});
				this.setState({ songs });
				this.forceUpdate();
			});
		});

	}
	render() {
		if (this.state.songs != null) {
			if (this.state.songs.length > 0) {
				return (
					<div className="panel panel-default templatemo-content-widget white-bg no-padding templatemo-overflow-hidden">
					<div className="panel-heading templatemo-position-relative"><h2>{this.state.keyword}</h2></div>
					<div className="table-responsive">
					<table className="table table-striped table-bordered">
					<thead>
					<tr>
					<th>Name</th>
					<th>Artist</th>
					<th>Album</th>
					<th>Year</th>
					</tr>
					</thead>
					<tbody>{this.state.songs}</tbody>
					</table>
					</div>
					</div>
					);
			}
			else {
				return(
					<div>
					<h2>Search : {this.state.keyword}</h2>
					<li>No matching songs.</li>
					</div>
					);
			}
		}
		else {
			return(
				<div>
				<h2>Search : {this.state.keyword}</h2>
				<li>Loading...</li>
				</div>
				);
		}

	}
}

class EditUser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			email: "",
			password: ""
		};

		this.handleChangeEmail = this.handleChangeEmail.bind(this);
		this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
		this.handleChangeName = this.handleChangeName.bind(this);
		this.handleSubmitName = this.handleSubmitName.bind(this);
		this.handleChangePassword = this.handleChangePassword.bind(this);
		this.handleSubmitPassword = this.handleSubmitPassword.bind(this);

	}

	handleChangeEmail(event) {
		this.setState({email: event.target.value});
	}

	handleSubmitEmail(event) {
		axios.put('/api/user/edit', {
			token: readCookie('token'),
			email: this.state.email,
			name: readCookie('name')
		})
		.then(response => {
			swal({
				title: "Email changed.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.setState({email: ""});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Failed to change email.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		
		event.preventDefault();
	}

	handleChangeName(event) {
		this.setState({name: event.target.value});
	}

	handleSubmitName(event) {
		axios.put('/api/user/edit', {
			token: readCookie('token'),
			name: this.state.name
		})
		.then(response => {
			swal({
				title: "Name changed.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			createCookie('name',this.state.name, 100);
			document.getElementById('sidebar-nome').innerHTML = readCookie('name');
			this.setState({name: ""});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Failed to change name.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	handleChangePassword(event) {
		this.setState({password: event.target.value});
	}

	handleSubmitPassword(event) {
		axios.put('/api/user/edit', {
			token: readCookie('token'),
			password: this.state.password,
			name: readCookie('name')
		})
		.then(response => {
			swal({
				title: "Password changed.",
				type: "success",
				timer: 2000,
				showConfirmButton: true
			});
			this.setState({password: ""});
			this.forceUpdate();
		})
		.catch(error => {
			swal({
				title: "Failed to change password.",
				text: error.response.data.message,
				type: "error",
				timer: 2000,
				showConfirmButton: true
			});
		});
		event.preventDefault();
	}

	render() {
		return (
			<div><h2>Edit User</h2>
			<form className="templatemo-login-form" onSubmit={this.handleSubmitName}>
			<label>
			Name:
			<input className="form-control" type="text" value={this.state.name} onChange={this.handleChangeName}/>
			</label>
			<input type="submit" className="templatemo-blue-button" value="Edit Name"/>
			</form>
			<form className="templatemo-login-form" onSubmit={this.handleSubmitEmail}>
			<label>
			Email:
			<input className="form-control" type="text" value={this.state.email} onChange={this.handleChangeEmail}/>
			</label>
			<input type="submit" className="templatemo-blue-button" value="Edit Email"/>
			</form>
			<form className="templatemo-login-form" onSubmit={this.handleSubmitPassword}>
			<label>
			Password:
			<input className="form-control" type="password" value={this.state.password} onChange={this.handleChangePassword}/>
			</label>
			<input type="submit" className="templatemo-blue-button" value="Edit Password"/>
			</form>
			</div>
			);
	}
}

class Player extends React.Component {
	constructor() {
		super();
		this.state = {
			id: "",
			title: "",
			artist: "",
			album: "",
			year: "",
			src: ""
		};
	}
	componentDidUpdate(prevProps, prevState) {
		document.getElementById("audio").load();
		document.getElementById("audio").play();
	}
	render() {
		if (this.state.id != "") {
			return(
				<div>
				<h2>Media Player</h2>
				<p>Song: {this.state.title} | Artist: {this.state.artist} | Album: {this.state.album} | Year: {this.state.year}</p>
				<audio id="audio" controls autoplay>
				<source src={this.state.src} type="audio/mpeg"/>
				</audio>
				</div>
				);
		}
		else {
			return (
				<div>
				<h2>Media Player</h2>
				<p>Nothing to play</p>
				</div>);
		}
	}
}

class Sidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.searchSongs = this.searchSongs.bind(this);
	}
	deleteUser() {
		var teste= swal({
			title: 'Are you sure you want to delete your account?',
			text: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then(function () {
			axios.delete('/api/user/delete', {
				params: {
					token: readCookie('token')
				}
			})
			.then(response => {
				eraseCookie('token');
				window.location.href = "/";
			});
		})
	}

	logout() {

		eraseCookie('token');
		window.location.href = "/";

	}

	editUser() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<EditUser />,
			document.getElementById('content')
			);
	}



	show(playlist) {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<Songs playlist={playlist} />,
			document.getElementById('content')
			);
	}

	mySongs() {

		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<Songs />,
			document.getElementById('content')
			);
	}
	addSong() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<AddSong />,
			document.getElementById('content')
			);
	}
	allMusic() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<AllSongs />,
			document.getElementById('content')
			);
	}
	myPlaylists() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<Playlists show={(playlist) => this.show(playlist)} />,
			document.getElementById('content')
			);
	}
	createPlaylist() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<CreatePlaylist />,
			document.getElementById('content')
			);
	}
	searchSongs() {
		document.getElementById('content').innerHTML = '';
		ReactDOM.render(
			<Search keyword={document.getElementById("search").value} />,
			document.getElementById('content')
			);
	}
	render() {
		return(
			<ul>
			<li>
			<form className="templatemo-search-form" onSubmit={this.searchSongs}>
			<div className="input-group">
			<button type="submit" className="fa fa-search"></button>
			<input type="text" className="form-control" placeholder="Search" id="search"/>           
			</div>
			</form>
			</li>
			<li><a href="#" onClick={() => this.mySongs()}><i className="fa fa-list fa-fw"></i>My Songs</a></li>
			<li><a href="#" onClick={() => this.addSong()}><i className="fa fa-music fa-fw"></i>Add Song</a></li>
			<li><a href="#" onClick={() => this.myPlaylists()}><i className="fa fa-list fa-fw"></i>My Playlists</a></li>
			<li><a href="#" onClick={() => this.createPlaylist()}><i className="fa fa-pencil fa-fw"></i>Create Playlist</a></li>
			<li><a href="#" onClick={() => this.allMusic()}><i className="fa fa-list fa-fw"></i>All Music</a></li>
			<li><a href="#" onClick={() => this.editUser()}><i className="fa fa-user fa-fw"></i>Edit User</a></li>
			<li><a href="#" onClick={() => this.deleteUser()}><i className="fa fa-trash fa-fw"></i>Delete User</a></li>
			<li><a href="#" onClick={() => this.logout()}><i className="fa fa-sign-out fa-fw"></i>Logout</a></li>
			</ul>
			);
	}
}

ReactDOM.render(
	<Sidebar />,
	document.getElementById('sidebar')
	);

document.getElementById('sidebar-nome').innerHTML = readCookie('name');

ReactDOM.render(
	<Songs />,
	document.getElementById('content')
	);

var player = ReactDOM.render(
	<Player />,
	document.getElementById('player')
	);

document.getElementById('sidebar-nome').innerHTML = readCookie('name');