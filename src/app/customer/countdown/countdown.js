angular.module('vir.customer.countdown', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'customer.countdown' , {
		url: '/countdown',
		views: {
			'customer': {
				controller: 'CountdownCtrl',
				templateUrl: 'customer/countdown/countdown.tpl.html'
			}
		},
		data: {
			pageTitle: 'Countdown'
		}
	});

})

.controller('CountdownCtrl', function($scope, $http, $ionicPopup) {
	$scope.deliveryTime = 0;
	

	function websocketCallback() {
		var socket = new WebSocket('ws://128.193.36.250:80');

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
				return 0;
			}

			if (!messageObject.body.deliveryTime) {
				alert('error: no delivery time');
				return 0;
			}

			$scope.deliveryTime = messageObject.body.deliveryTime;
			$scope.$apply();

			setInterval(function() {
				$scope.timeRemaining = ($scope.deliveryTime - new Date().getTime())/1000;
				$scope.$apply();
			}, 1000);
		};
	}

	setTimeout(function() {
		if (!$scope.settings.name|| $scope.settings.name.length === 0) {
			var namePopup = $ionicPopup.show({
				template: '<input type="text" ng-model="settings.name">',
				title: 'Enter Your Name',
				subTitle: 'Just firstname is ok',
				scope: $scope,
				buttons: [{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if (!$scope.settings.name) {
							e.preventDefault();
						} else {
							return $scope.settings.name;
						}
					}
				}]
			});
			
			namePopup.then(function(name) {
				if (name) {
					websocketCallback();
				}
			});
		} else {
			websocketCallback();
		}
	}, 100); //done this way since angular template will be displayed unrendered otherwise.
});
