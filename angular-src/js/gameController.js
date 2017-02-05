(function(){
	angular.module('tttgame')
		.controller('gameController', gameController);

	gameController.$inject = ['$log', 'cellsManager', '$timeout', 'socketManager', '$rootScope'];

	function gameController ($log, cellsManager, $timeout, socketManager, $rootScope) {
		var vm = this;
		vm.userReady = false;
		vm.getCells = cellsManager.getCells;
		var socket = socketManager.getSocket();
		//vm.startGame = startGame;

		init ();

		function init () {
			adjustCellsSizeOnLoad();
			sendReadySignalToServer();
			socket.on("game-info", onGameInfo);
		}


		function onGameInfo(gameInfo) {
			console.log(gameInfo);
		}


		/*
		* check if cells are loaded, then apply style
		*/
		function adjustCellsSizeOnLoad () {
			if ($('.cell').length === 9) {
				cellsManager.adjustSizes();
			}
			else {
				$timeout(adjustCellsSizeOnLoad, 100);
			}
		}

		function sendReadySignalToServer() {
			console.log('sendReadySignalToServer = ' + $rootScope.gameID);
			var randTime = Math.floor(Math.random() * 5000);

			$timeout(function() {
				socketManager.send("ready", $rootScope.gameID);
			}, randTime);
		}

	}
})()