(function(){
	angular.module('tttgame')
		.controller('gameController', gameController);

	gameController.$inject = ['$log', 'cellsManager', '$timeout'];

	function gameController ($log, cellsManager, $timeout) {
		var vm = this;
		vm.getCells = cellsManager.getCells;

		init ()

		function init () {
			adjustCellsSizeOnLoad();
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



	}
})()