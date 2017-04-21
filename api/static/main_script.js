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

	componentDidMount() {
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
	render() {

		if (this.state.songs != null) {
			if (this.state.songs.length > 0) {
				return (
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

					);
			}
			else {
				return(
					<li>No songs added yet.</li>
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

	update(key) {
		var playlists = this.state.playlists;
		for (var i = 0; i < playlists.length; i++) {
			if (playlists[i].key == key) {
				var playlist = playlists[i].props.playlist;
				playlist.name = playlist.original;
				if (playlists[i].props.editable != "true") playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} editable="true" onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} />
					else playlists[i] = <Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} onChange={() => this.change(playlist.id)} />
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
					response.data.playlists.forEach((playlist) => {
						playlists.push(<Playlist playlist={playlist} key={playlist.id} value={playlist.id} onClick={() => this.delete(playlist.id)} onUpdate={() => this.update(playlist.id)} />);
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
		constructor() {
			super();
			this.state = {};
		}
		delete() {
			console.log("cona");
		}
		
		mySongs() {
			const songs = this.state.songs;
			document.getElementById('content').innerHTML = '';
			ReactDOM.render(
				<Songs songs={songs} onClick={(i) => this.delete(i)}/>,
				document.getElementById('content')
				);
		}
		myPlaylists() {
			document.getElementById('content').innerHTML = '';
			ReactDOM.render(
				<Playlists />,
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
				<li><a href="#" onClick={() => this.myPlaylists()}>My Playlists</a></li>
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