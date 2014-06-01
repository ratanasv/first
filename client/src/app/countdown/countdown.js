angular.module('vir.countdown', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'countdown' , {
		url: '/countdown',
		views: {
			'main': {
				controller: 'CountdownCtrl',
				templateUrl: 'countdown/countdown.tpl.html'
			}
		},
		data: {
			pageTitle: 'Countdown'
		}
	});

})

.controller('CountdownCtrl', function($scope, $http) {
	
});

