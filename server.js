//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var socketManager = require('./node-code/socket-manager');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'src')));

io.on('connection', function (socket) {
    // messages.forEach(function (data) {
    //   socket.emit('message', data);
    // });

    //When a new socket connects
    socketManager.addSocket(socket);

    //When this socket connection disconnects
    socket.on('disconnect', function () {
    	console.log('Server: disconnected');
    	socketManager.deleteSocket(socket.id);
    });

    socket.on("new-game-request", function (username) {
        console.log("new-game-request received from " + username);
    	var sessionID = socketManager.startNewGameSession(socket.id, username);
        socketManager.send(socket.id, "new-game-created", sessionID);
    });


    socket.on("join-game-request", function (joiningInfo) {
        console.log("join-game-request received from " + joiningInfo.username + " and gameID="+joiningInfo.gameID);
        socketManager.joinGame(joiningInfo);
        socketManager.sendToGameIDPlayers(joiningInfo.gameID, "game-join-successful", undefined);
    });

    /*
    * When user is ready to play,
    * Check if both the players are ready
    * If both are ready start the game
    */
    socket.on("ready", function (gameID) {
        socketManager.markPlayerAsReady(gameID, socket.id);

        console.log("ready received... from socket id="+socket.id);
        
        var players = socketManager.getPlayers(gameID);

        console.log("players=");
        console.log(players);

        if(players[0]["ready"] && players[1]["ready"]) {
            startGame(gameID, players);
        } else {
            console.log('All player are not ready');
            console.log(socketManager.getPlayers(gameID));
        }

    })



    // socket.on('identify', function (name) {
    //   socket.set('name', String(name || 'Anonymous'), function (err) {
    //     updateRoster();
    //   });
    // });
});


function startGame(gameID, players) {
    console.log('inside startGame');
    console.log(gameID); console.log(players);

    var rand = Math.floor(Math.random() * 2);    
    var goi = makeGameInfoObj(gameID, players, players[rand]);
    socketManager.sendToGameIDPlayers(gameID, "game-info", goi);
}

function makeGameInfoObj (gameID, players, whosTurn) {
    var gameObject = {};
    gameObject.players = players;
    gameObject.whosTurn = whosTurn;
    return gameObject;
}



// function updateRoster() {
//   async.map(
//     sockets,
//     function (socket, callback) {
//       socket.get('name', callback);
//     },
//     function (err, names) {
//       broadcast('roster', names);
//     }
//   );
// }

// function broadcast(event, data) {
//   sockets.forEach(function (socket) {
//     socket.emit(event, data);
//   });
// }

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
