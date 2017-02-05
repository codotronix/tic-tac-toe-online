(function(){
	angular.module('tttgame')
		.factory('socketManager', socketManager);

	socketManager.$inject = ['$log'];

	function socketManager ($log) {
		var socket = io.connect();
		var gameID = undefined;
		socket.on('connect', connectionEstablished);

		return {
			"send": sendToServer,
			"getSocket": getSocket,
			"getGameID": getGameID,
			"setGameID": setGameID
		}; //factory return ENDS


		function getGameID () {
			return gameID;
		}

		function setGameID (id) {
			gameID = id;
		}

		function getSocket () {
			return socket;
		}


		function sendToServer (event, data) {
			console.log('Sending event = '+event);
			console.log('Sending data = '); console.log(data);
			socket.emit(event, data);
		}


		function connectionEstablished () {
			$log.debug('connected...');
		}	
	}
})()