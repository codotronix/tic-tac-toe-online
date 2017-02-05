(function(){
	angular.module('tttgame')
		.controller('homeController', homeController);

	homeController.$inject = ['$log', 'cellsManager', '$timeout'];

	function homeController ($log, cellsManager, $timeout) {
		var vm = this;
		var socket = undefined;

		init ();

		function init () {
			establishConnection ();
		}

		function establishConnection () {
			socket = io.connect();
			socket.on('connect', connectionEstablished);
		}

		function connectionEstablished (res) {
			$log.debug('connected...');$log.debug(res);
		}		

	}
})()