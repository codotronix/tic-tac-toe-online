(function(){
	angular.module('tttgame')
		.config(['$routeProvider', function($routeProvider) {
		    $routeProvider
		    .when('/home', {
		        templateUrl:'partials/home.html'
		        
		    })
		    .when('/game', {
		        templateUrl:'partials/game.html',
		        controller: 'gameController',
		        controllerAs: 'vm'
		    })
		    .when('/', {
		        redirectTo: '/home'
		    })
		    .otherwise({
		        redirectTo: '/'
		    });        
		}])
})()