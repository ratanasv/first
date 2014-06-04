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
	var timerId;

	if (!$scope.settings.name || $scope.settings.name.length === 0) {
		return alert('input valid name');
	}

	var socket = new WebSocket('ws://128.193.36.250:80');
	var deliveryTime = 0;
	socket.onopen = function() {
		socket.send(JSON.stringify(
			{
				method: 'getDeliveryTime',
				params: {
					customer: $scope.settings.name
				}
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

		if (!messageObject.body.deliveryTime) {
			alert('error: no delivery time');
			return 0;
		}

		deliveryTime = messageObject.body.deliveryTime;
		$scope.$apply();
	};
	timerId = setInterval(function() {
		$scope.timeRemaining = (deliveryTime - new Date().getTime())/1000;
		$scope.$apply();
	}, 1000);
});

