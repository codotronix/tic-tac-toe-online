module.exports = {
	"addSocket": addSocket,
	"deleteSocket": deleteSocket,
	"startNewGameSession": startNewGameSession,
	"joinGame": joinGame,
	"sendToAll": sendToAll,
	"sendToGameIDPlayers": sendToGameIDPlayers,
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
	delete sockets[socket.id];	
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


function joinGame (joiningInfo) {
	var user = {};
	user.username = joiningInfo.username;
	user.socketID = joiningInfo.socketID;
	if (gameSessions[joiningInfo.gameID] !== undefined) {
		gameSessions[joiningInfo.gameID].users[1] = user;
		return true;
	}
	else {
		console.log('joining game failed... gameID='+joiningInfo.gameID+' does not exist');
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
		send(user.socketID, event, data);
	});
}


function sendToGameIDPlayers (gameID, event, data) {
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