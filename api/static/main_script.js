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
		// this.setState({name: event.target.value});

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
		.then(function (res) {
			alert("PORREIRO PA!");
			this.setState({
				title: "",
				artist: "",
				album: "",
				year: ""
			});
		})
		.catch(function (err) {
			alert("UPS!");
		});
		event.preventDefault();
	}

	render() {
		return (
			<div><h2>Add Song</h2>
			<form onSubmit={this.handleSubmit}>
			<label>
			Title:
			<input type="text" name="title" value={this.state.title} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Artist:
			<input type="text" name="artist" value={this.state.artist} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Album:
			<input type="text" name="album" value={this.state.album} onChange={this.handleChange}/>
			</label><br/>
			<label>
			Year:
			<input type="text" name="year" value={this.state.year} onChange={this.handleChange}/>
			</label><br/>
			<label>
			File:
			<input type="file" name="file" id="file"/>
			</label><br/>
			<input type="submit" value="Create"/>
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
		console.log(this.state.name);
		axios.post('/api/playlist', {
			token: readCookie('token'),
			name: this.state.name
		})
		.then(response => {
			alert("Playlist criada");
			console.log("Actualizado no servidor.");
			console.log(response);
			this.setState({name: ""});
			this.forceUpdate();
		});
		event.preventDefault();
	}

	render() {
		return (
			<div><h2>Create Playlist</h2>
			<form onSubmit={this.handleSubmit}>
			<label>
			Playlist name:
			<input type="text" value={this.state.name} onChange={this.handleChange}/>
			</label>
			<input type="submit" value="Create"/>
			</form>
			</div>
			);
	}

}

class AllSong extends React.Component {
	constructor(props) {
		super(props);
		console.log("AQUI MANE");
		console.log(props);
		this.state = {
			playlists: props.playlists,
			value: props.playlists[0].props.value
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		console.log(this.state.value);
		var songs = [];
		songs.push(this.props.song.id);
		axios.post('/api/playlist/song', {
			token: readCookie('token'),
			id: this.state.value,
			songs: songs
		})
		.then(response => {
			console.log("Actualizado no servidor.");
			console.log(response);
			this.forceUpdate();
		});
		event.preventDefault();
	}

	render() {
		return (
			<tr key={this.props.song.id}>
			<td>{this.props.song.title}</td>
			<td>{this.props.song.artist}</td>
			<td>{this.props.song.album}</td>
			<td>{this.props.song.year}</td>
			<td>
			<form onSubmit={this.handleSubmit}>
			<select value={this.state.value} onChange={this.handleChange}>
			{this.state.playlists}
			</select>
			<input type="submit" value="Add to playlist"/>
			</form>
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
						console.log(this.props);
					});
				}
				console.log(playlists);
				this.setState({playlists});
				this.setState({ songs });
				this.forceUpdate();
			});
			this.setState({ songs });
		});
		
	}
	render() {
		if (this.state.songs != null) {
			if (this.state.songs.length > 0) {
				return (
					<div>
					<h2>All Songs</h2>
					<table>
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
					);
			}
			else {
				return(
					<div>
					<h2>All Songs</h2>
					<li>No songs added yet.</li>
					</div>
					);
			}
		}
		else {
			return(
				<div>
				<h2>All Songs</h2>
				<li>Loading...</li>
				</div>
				);
		}
		
	}
}


function Song(props) {
	return (
		<tr key={props.song.id}>
		<td>{props.song.title}</td>
		<td>{props.song.artist}</td>
		<td>{props.song.album}</td>
		<td>{props.song.year}</td>
		<td>
		<button onClick={() => props.onClick()}>Delete</button>
		</td>
		<td>
		<button onClick={() => props.onClick()}>Add to playlist</button>
		</td>
		</tr>
		);
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
						console.log("Removido do servidor.");
						console.log(response);
						songs.splice(i, 1);
						this.setState({songs})
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
						console.log("Removido do servidor.");
						console.log(response);
						songs.splice(i, 1);
						this.setState({songs})
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
				if (response.data.songs != null) {
					response.data.songs.forEach((song) => {
						songs.push(<Song song={song} key={song.id} value={song.id} onClick={() => this.delete(song.id)} />);
						console.log(this.props);
					});
				}
				this.setState({ songs });
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
				if (response.data.songs != null) {
					response.data.songs.forEach((song) => {
						songs.push(<Song song={song} key={song.id} value={song.id} onClick={() => this.delete(song.id)} />);
						console.log(this.props);
					});
				}
				this.setState({ songs });
			});
		}
	}
	render() {
		if (this.props.playlist == null) {
			if (this.state.songs != null) {
				if (this.state.songs.length > 0) {
					return (
						<div>
						<h2>My Songs</h2>
						<table>
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
						<div>
						<h2>{this.props.playlist.name}</h2>
						<table>
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
		console.log(event.target.value);
	}

	handleSubmit(event) {
		axios.put('/api/playlist', {
			token: readCookie('token'),
			id: this.props.playlist.id,
			name: this.props.playlist.name
		})
		.then(response => {
			console.log("Actualizado no servidor.");
			console.log(response);
			this.props.playlist.original = this.props.playlist.name;
			delete this.props.editable;
			this.forceUpdate();
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
				<button onClick={() => this.props.onClick()}>Delete</button>
				</td>
				<td>
				<button onClick={() => this.props.onUpdate()}>Modify playlist</button>
				</td>
				<td>
				<button onClick={() => this.props.onShow()}>View playlist</button>
				</td>
				</tr>
				);
		}
		else {
			return (
				<tr key={this.props.playlist.id}>
				<td>
				<form onSubmit={this.handleSubmit}>
				<input type="text" value={this.props.playlist.name} onChange={this.handleChange}/>
				<input type="submit" hidden/>
				</form>
				</td>
				<td>{this.props.playlist.size}</td>
				<td>{this.props.playlist.date}</td>
				<td>
				<button onClick={() => this.props.onClick()}>Delete</button>
				</td>
				<td>
				<button onClick={() => this.props.onUpdate()}>Cancel modification</button>
				</td>
				<td>
				<button onClick={() => this.props.onShow()}>View playlist</button>
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
					console.log("Removido do servidor.");
					console.log(response);
					playlists.splice(i, 1);
					this.setState({playlists})
				});

				break;
			}
		}
	}

	change(key) {
		console.log("mudando");
	}

	sort(which) {
		var playlists = this.state.playlists;
		if (this.state[which] == 0) {
			playlists.sort(function(a,b) {
				console.log(a);
				return (a.props.playlist[which] < b.props.playlist[which]) ? 1 : ((b.props.playlist[which] > a.props.playlist[which]) ? -1 : 0);
			});
		}
		else {
			playlists.sort(function(a,b) {
				console.log(a);
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
				if (playlists[i].props.editable != "true") playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} editable="true" onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} onShow={() => this.props.show(playlist)} />
					else playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} onShow={() => this.props.show(playlist)} />
						this.setState({playlists})
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
					console.log("aqui");
					console.log(this.props);
					response.data.playlists.forEach((playlist) => {
						playlists.push(<Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onShow={() => this.props.show(playlist)}/>);
						console.log(this.props);
					});
				// playlists.sort(function(a,b) {
				// 	console.log(a);
				// 	return (a.props.playlist.name < b.props.playlist.name) ? 1 : ((b.props.playlist.name > a.props.playlist.name) ? -1 : 0);
				// } ); 

			}
			this.setState({ playlists });
		});
		}
		render() {

			if (this.state.playlists != null) {
				if (this.state.playlists.length > 0) {
					return (
						<table>
						<thead>
						<tr>
						<th onClick={() => this.sort("name")}>Name</th>
						<th onClick={() => this.sort("size")}>Size</th>
						<th onClick={() => this.sort("date")}>Date</th>
						</tr>
						</thead>
						<tbody>{this.state.playlists}</tbody>
						</table>

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

	class Options extends React.Component {
		constructor(props) {
			super(props);
			this.state = {};
		}
		delete() {
			console.log("cona");
		}

		show(playlist) {
			document.getElementById('content').innerHTML = '';
			ReactDOM.render(
				<Songs playlist={playlist} />,
				document.getElementById('content')
				);
		}

		mySongs() {
			const songs = this.state.songs;
			document.getElementById('content').innerHTML = '';
			ReactDOM.render(
				<Songs songs={songs} onClick={(i) => this.delete(i)} show={(i) => this.show(i)}/>,
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
			ReactDOM.render(
				<Songs />,
				document.getElementById('content')
				);
		}
		render() {
			return(
				<ul>
				<li><a href="#" onClick={() => this.mySongs()}>My Songs</a></li>
				<li><a href="#" onClick={() => this.addSong()}>Add Song</a></li>
				<li><a href="#" onClick={() => this.myPlaylists()}>My Playlists</a></li>
				<li><a href="#" onClick={() => this.createPlaylist()}>Create Playlist</a></li>
				<li><a href="#" onClick={() => this.allMusic()}>All Music</a></li>
				<li><a href="#" onClick={() => this.searchSongs()}>Search Music</a></li>
				</ul>
				);
		}
	}

	class SecondComponent extends React.Component {
		render() {
			const token = readCookie('token');
			return(
				<p>Your token is {token}</p>
				);
		}
	}

	class Welcome extends React.Component {
		render() {
			const name = readCookie('name');
			return(
				<div>
				<h2>{name}'s playlists</h2>
				<SecondComponent />
				</div>
				);
		}
	}

	ReactDOM.render(
		<Welcome />,
		document.getElementById('content')
		);

	ReactDOM.render(
		<Options />,
		document.getElementById('options')
		);