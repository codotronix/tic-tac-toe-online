(function(){
	angular.module('tttgame')
		.factory('cellsManager', cellsManager);

	cellsManager.$inject = ['$log'];

	function cellsManager ($log) {
		var cells = undefined;
		return {
			getCells: function () {				
				if(cells !== undefined) {
					return cells;
				}
				else {
					cells = [];
					var cell;
					for (var i=0; i<9; i++) {
						cell = {};
						cell.id = 'cell-' + (i+1);
						// cell.sign = 'circle';
						cells.push(cell);
					}

					return cells;
				}
			},
			adjustSizes: function  () {
				$('.cell').height($('.cell').width());
				$('.sign').css('font-size', $('.cell-inner').height());
			}
		}		
	}
})()