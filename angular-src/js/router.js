(function(){
	angular.module('tttgame')
		.config(['$routeProvider', function($routeProvider) {
		    $routeProvider
		    .when('/home', {
		        templateUrl:'partials/home.html',
		        controller: 'homeController',
		        controllerAs: 'vm'
		        
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