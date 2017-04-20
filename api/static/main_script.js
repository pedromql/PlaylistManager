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

function Square(props) {
	$.ajax({
		data: JSON.stringify({
			"email":"teste@teste.teste",
			"password":"testeteste"
		}),
		url: "/api/user/login",
		method: "POST",
		contentType: "application/json",
		success: function(result) {
				//result = JSON.parse(result);
				console.log(result);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				changeAlertBanner("alertBanner","Problemas na ligação ao servidor!", "", "warning");
			}
		});
	return (
		<button className="square" onClick={() => props.onClick()}>
		{props.value}
		</button>
		);
}

class Board extends React.Component {
	renderSquare(i) {
		const squares = this.props.squares;
		return <Square value={squares[i]} onClick={() => this.props.onClick(i)} />;
	}
	render() {
		return (
			<div>
			<div className="board-row">
			{this.renderSquare(0)}
			{this.renderSquare(1)}
			{this.renderSquare(2)}
			</div>
			<div className="board-row">
			{this.renderSquare(3)}
			{this.renderSquare(4)}
			{this.renderSquare(5)}
			</div>
			<div className="board-row">
			{this.renderSquare(6)}
			{this.renderSquare(7)}
			{this.renderSquare(8)}
			</div>
			</div>
			);
	}
}

class Game extends React.Component {
	constructor() {
		super();
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			stepNumber: 0,
			xIsNext: true,
		};
	}
	handleClick(i) {
		var history = this.state.history.slice(0, this.state.stepNumber + 1);
		var current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		squares[i] = this.state.xIsNext ? 'X' : 'O';

		this.setState({
			history: history.concat([{
				squares: squares
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}
	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) ? false : true,
		});
	}
	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];

		const winner = calculateWinner(current.squares);
		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		const moves = history.map((step, move) => {
			const desc = move ?
			'Move #' + move :
			'Game start';
			return (
				<li key={move}>
				<a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
				</li>
				);
		});

		return (
			<div className="game">
			<div>
			<Board
			squares={current.squares}
			onClick={(i) => this.handleClick(i)}
			/>
			</div>
			<div className="game-info">
			<div>{status}</div>
			<ol>{moves}</ol>
			</div>
			</div>
			);
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
		<button>Add to playlist</button>
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
	renderSong(i) {
		const songs = this.props.songs;
		return <Song value={song[i]} onClick={() => this.props.onClick(i)} />;
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
					songs.push(<Song song={song} key={song.id} value={song.id} onClick={() => this.props.onClick(song.id)} />);
				});
			}
			this.setState({ songs });
		});
	}

	// componentDidMount() {
	// 	var songs =[];
	// 	axios.get('/api/song/list', {
	// 		params: {
	// 			token: readCookie('token')
	// 		}
	// 	})
	// 	.then(function (response) {
	// 		console.log("axios");
	// 		console.log(response);
	// 		response.data.songs.forEach((song) => {
	// 			songs.push(<Song song={song} key={song.id} value={song.id} onClick={() => this.props.onClick(song.id)} />);
	// 		});
	// 		console.log(songs);
	// 		this.setState({songs});
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});
	// }
	render() {
		// $.ajax({
		// 	async: false,
		// 	data: {
		// 		"token":readCookie('token')
		// 	},
		// 	dataType: 'json',
		// 	url: "/api/song/list",
		// 	method: "GET",
		// 	contentType: "application/json",
		// 	success: function(result) {
		// 		//result = JSON.parse(result);
		// 		console.log(result);
		// 		console.log(result.songs)
		// 		result.songs.forEach((song) => {
		// 			songs.push(<Song song={song} key={song.id} value={song.id} onClick={() => this.props.onClick(song.id)} />);
		// 		});
		// 		//songs = result.songs;
		// 		console.log(songs);
		// 	},
		// 	error: function(XMLHttpRequest, textStatus, errorThrown) {
		// 		console.log(XMLHttpRequest);
		// 		console.log(textStatus);
		// 		console.log(errorThrown);
		// 		//changeAlertBanner("alertBanner","Problemas na ligação ao servidor!", "", "warning");
		// 	}
		// });
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

class Playlists extends React.Component {
	render() {
		var playlists;
		$.ajax({
			async: false,
			data: {
				"token":readCookie('token')
			},
			dataType: 'json',
			url: "/api/playlists",
			method: "GET",
			contentType: "application/json",
			success: function(result) {
				//result = JSON.parse(result);
				console.log(result);
				console.log(result.playlists)
				playlists = result.playlists;
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				//changeAlertBanner("alertBanner","Problemas na ligação ao servidor!", "", "warning");
			}
		});
		if (playlists.length > 0) {
			return (
				<table>
				<thead>
				<tr>
				<th>Name</th>
				<th>Size</th>
				</tr>
				</thead>
				<tbody>
				{
					playlists.map(function(playlist) {
						return( <tr key={playlist.id}> 
							<td>{playlist.name}</td> 
							<td>{playlist.size}</td> 
							</tr>)
					})
				}
				</tbody>
				</table>
				
				);
		}
		else {
			return(
				<li>No playlists added yet!</li>
				);
		}
	}
}

class Options extends React.Component {
	constructor() {
		super();
		this.state = {};
	}
	mockSongs(songs) {
		this.setState({
			songs: ['song1','song2']
		})
	}
	mySongs() {
		const songs = this.state.songs;
		ReactDOM.render(
			<Songs songs={songs} onClick={(i) => this.mockSongs(i)}/>,
			document.getElementById('content')
			);
	}
	myPlaylists() {
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

function calculateWinner(squares) {
	const lines = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}
