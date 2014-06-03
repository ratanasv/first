angular.module('vir.countdown', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'barista' , {
		url: '/barista',
		views: {
			'main': {
				controller: 'BaristaCtrl',
				templateUrl: 'barista/barista.tpl.html'
			}
		},
		data: {
			pageTitle: 'Barista'
		}
	});

})

.controller('BaristaCtrl', function($scope) {
	$scope.orders = [];
	var socket = new WebSocket('wss://128.193.36.250:443');
	socket.onopen = function() {
		socket.send(JSON.stringify(
			{
				method: 'getInFlightOrders'
			}
		));
	};
	socket.onmessage = function(message) {
		var messageObject = JSON.parse(message.data);
		if (messageObject.code !== 200) {
			alert('error: ' + messageObject.header);
			clearInterval(timerId);
			return 0;
		}

		
		
		$scope.$apply();
	};
	timerId = setInterval(function() {
		
		$scope.$apply();
	}, 1000);
});

