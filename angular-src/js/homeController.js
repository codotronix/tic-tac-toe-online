(function(){
	angular.module('tttgame')
		.controller('homeController', homeController);

	homeController.$inject = ['$log', 'cellsManager', '$timeout', 'socketManager', '$location', '$rootScope'];

	function homeController ($log, cellsManager, $timeout, socketManager, $location, $rootScope) {
		var vm = this;
		vm.username = undefined;
		vm.gameID = undefined;
		var socket = undefined;

		vm.startNewGame = startNewGame;
		vm.joinGame = joinGame;

		init ();

		function init () {
			socket = socketManager.getSocket();
			socket.on("new-game-created", onNewGameCreation);
			socket.on("game-join-successful", onGameJoinSuccessful);
		}


		function startNewGame () {
			if(vm.username.length <= 0) {
				console.log('Please enter your name...');
				return;
			}
			$rootScope.username = vm.username;
			socketManager.send ("new-game-request", vm.username);			
		}


		function onNewGameCreation (newGameID) {
			vm.gameID = newGameID;
			console.log('Tell your partner to join the game with ID = ' + newGameID);
			$rootScope.gameID = vm.gameID;
		}


		function joinGame () {
			if(vm.gameID.length <= 0 || vm.username.length <= 0) {
				console.log('Enter your name and gameID to join...');
				return;
			}

			var joiningInfo = {
				"socketID": socket.id,
				"username": vm.username,
				"gameID": vm.gameID
			};


			$rootScope.username = vm.username;
			$rootScope.gameID = vm.gameID;
			socketManager.send ("join-game-request", joiningInfo);			
		}


		function onGameJoinSuccessful () {
			console.log('inside onGameJoinSuccessful... Redirect to Game Page... $rootScope.gameID='+$rootScope.gameID);

			$timeout(function () {
				console.log();
				$location.path('/game');
			}, 1000);				
		}

		function connectionEstablished (res) {
			$log.debug('connected...');$log.debug(res);
		}		

	}
})()