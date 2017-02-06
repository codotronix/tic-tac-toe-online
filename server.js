//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

//var async = require('async');
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

router.use(express.static(path.resolve(__dirname, 'jquery-src')));

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





    socket.on("NEW_GAME", function (username) {
        console.log("new-game-request received from " + username);
        
        //Ask socket manager to create a new game session id
    	var gameID = socketManager.startNewGameSession(socket.id, username);

        //Send this newly created gameID back to client
        socketManager.send(socket.id, "GAME_CREATED", gameID);
    });






    socket.on("JOIN_GAME", function (userInfo) {
        console.log("join-game-request received from " + userInfo.username 
            + " and gameID="+userInfo.gameID);
        
        //Try to add this player to this gameID
        var success = socketManager.joinGame(userInfo);

        if (success) {
            //Choose between 0 or 1, who will play 1st
            var rand = Math.floor(Math.random() * 2);
            var gameMsg = {};
            gameMsg.gameID = userInfo.gameID;
            gameMsg.type = 'Init';
            gameMsg.players = socketManager.getPlayers(userInfo.gameID);
            gameMsg.whoseTurn = gameMsg.players[rand];
            gameMsg.cells = getBlankCells();

            //Voila!!! Send BOTH THE PLAYER 1st GAME_MSG
            socketManager.sendTo_Players_of_GameID(userInfo.gameID, "GAME_MSG", gameMsg);
        } 
        else {
            var err = {};
            err.type = "JOINING_ERROR";
            err.msg = "Check if GAME-ID is correct...";
            socketManager.send(userInfo.gameID, "ERROR", err);
        }
        
    });



    socket.on("GAME_MSG", function (gameMsg) {
        console.log("received gameMsg..."); console.log(gameMsg);
        //check if anyone has won
        //if(hasAnyoneWon) {}
        //else {...}

        //Change the turn 
        if(gameMsg.whoseTurn.username === gameMsg.players[0].username) {
            gameMsg.whoseTurn = gameMsg.players[1];
        } else {
            gameMsg.whoseTurn = gameMsg.players[0];
        }

        gameMsg.type = "Running";

        socketManager.sendTo_Players_of_GameID(gameMsg.gameID, "GAME_MSG", gameMsg);
    });

//Sample gameMsg JSON structure
    //    {
    //     "gameID": "123456",
    //     "type": "Init",
    //     "players": [
    //         {
    //             "socketID": "WCvaQghnIJmIU9UBAAAP",
    //             "username": "Suman Barick",
    //             "sign": "cross"
    //         }, {
    //             "username": "Pritam Das",
    //             "socketID": "KX-BSWY3W1aDS9AyAAAQ",
    //             "sign": "circle"
    //         }
    //     ],
    //     "whoseTurn": {
    //         "socketID": "WCvaQghnIJmIU9UBAAAP",
    //         "username": "Suman Barick",
    //         "sign": "cross"
    //     },
    //     "cells": [
    //         {
    //             "id": "cell-1",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-2",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-3",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-4",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-5",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-6",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-7",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-8",
    //             "sign": "blank"
    //         }, {
    //             "id": "cell-9",
    //             "sign": "blank"
    //         }
    //     ]
    // }



    /*
    * When user is ready to play,
    * Check if both the players are ready
    * If both are ready start the game
    */
    // socket.on("ready", function (gameID) {
    //     socketManager.markPlayerAsReady(gameID, socket.id);

    //     console.log("ready received... from socket id="+socket.id);
        
    //     var players = socketManager.getPlayers(gameID);

    //     console.log("players=");
    //     console.log(players);

    //     if(players[0]["ready"] && players[1]["ready"]) {
    //         startGame(gameID, players);
    //     } else {
    //         console.log('All player are not ready');
    //         console.log(socketManager.getPlayers(gameID));
    //     }

    // })



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
    socketManager.sendTo_Players_of_GameID(gameID, "game-info", goi);
}

function makeGameInfoObj (gameID, players, whosTurn) {
    var gameObject = {};
    gameObject.players = players;
    gameObject.whosTurn = whosTurn;
    return gameObject;
}


function getBlankCells () {
    var cells = [];
    var cell;
    for (var i=1; i<=9; i++) {
        cell = {};
        cell.id = 'cell-' + i;
        cell.sign = 'blank';
        cells.push(cell);
    }

    return cells;
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

server.listen(process.env.PORT || 8080, process.env.IP || "127.0.0.1", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
