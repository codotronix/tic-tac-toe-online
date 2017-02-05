module.exports = {
	"addSocket": addSocket,
	"deleteSocket": deleteSocket,
	"startNewGameSession": startNewGameSession,
	"joinGame": joinGame,
	"sendToAll": sendToAll,
	"sendTo_Players_of_GameID": sendTo_Players_of_GameID,
	"send": send,
	"getPlayers": getPlayers,
	"markPlayerAsReady": markPlayerAsReady
}

var sockets = {};	//socketID: socket mapping
var gameSessions = {}; //gameID: userArray mapping


function addSocket (socket) {
	console.log('Adding socket with id = ' + socket.id);
	sockets[socket.id] = socket;
}


function deleteSocket (socketID) {
	console.log('Deleting socket with id = ' + socketID);
	delete sockets[socketID];	
}


function startNewGameSession (socketID, username) {
	var gameSession = {};
	var gameID = createUniqID();
	gameSession.users = [];
	gameSession.users[0] = {
		"socketID": socketID,
		"username": username
	};

	gameSessions[gameID] = gameSession;
	return gameID;
}


function createUniqID () {
	var ID = Math.floor(Math.random() * 1000) + "" + Math.floor(Math.random() * 1000);
	return ID;
}


function joinGame (userInfo) {
	var user = {};
	user.username = userInfo.username;
	user.socketID = userInfo.socketID;
	if (gameSessions[userInfo.gameID] !== undefined) {
		gameSessions[userInfo.gameID].users[1] = user;

		//assign signs
		gameSessions[userInfo.gameID].users[0].sign = "cross";
		gameSessions[userInfo.gameID].users[1].sign = "circle";

		return true;
	}
	else {
		console.log('joining game failed... gameID='+userInfo.gameID
			+' does not exist');
		return false;
	}	
}


function send (socketID, event, data) {
	//console.log(sockets);
	//var socketIndex = getSocketIndex(socketID);
	if(sockets[socketID] !== undefined) {
		var socket = sockets[socketID];
		socket.emit(event, data);
	}
	else {
		console.log("socket not found, socketID = " +socketID);
	}
}


function sendToAll (userArray, event, data) {
	userArray.forEach(function(user){
		console.log('Sending '+event+' event to ' + user.socketID);
		send(user.socketID, event, data);
	});
}


function sendTo_Players_of_GameID (gameID, event, data) {
	sendToAll(gameSessions[gameID].users, event, data);
}


function getPlayers (gameID) {
	return gameSessions[gameID].users;
}


function markPlayerAsReady (gameID, socketID) {
	for (var i in gameSessions[gameID].users) {
		if (gameSessions[gameID].users[i]["socketID"] === socketID) {
			gameSessions[gameID].users[i]["ready"] = true;
			return;
		}
	}
}