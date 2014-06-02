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
	var socket = new WebSocket('wss://localhost:443');
	var deliveryTime = new Date().getTime() + (1000*40);
	socket.onopen = function() {
		socket.send(JSON.stringify({
			customer: 'Test Customer'
		}));
	};
	socket.onmessage = function(message) {
		var response = JSON.parse(message.data);
		if (response.deliveryTime) {
			deliveryTime = response.deliveryTime;
			$scope.$apply();
		}
	};
	setInterval(function() {
		$scope.timeRemaining = (deliveryTime - new Date().getTime())/1000;
		$scope.$apply();
	}, 1000);
});

