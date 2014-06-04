angular.module('vir.barista', [
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

.controller('BaristaCtrl', ['$scope', 'findIndexOf', function($scope, findIndexOf) {
	$scope.orders = [];
	var socket = new WebSocket('wss://128.193.36.250:443');
	socket.onopen = function() {
		socket.send(JSON.stringify(
			{
				method: 'getInFlightOrders',
				params: {}
			}
		));
	};
	socket.onmessage = function(message) {
		var messageObject = JSON.parse(message.data);
		var payload = messageObject.body;
		if (messageObject.code !== 200) {
			alert('error: ' + messageObject.header);
			return 0;
		}

		payload.orders.forEach(function(order, i) {

			var found = findIndexOf($scope.orders, function(element) {
				if (order.customer === element.customer) {
					return 1;
				} else {
					return 0;
				}
			});

			if (found === -1) {
				$scope.orders.push(payload.orders[i]);
			} else {
				$scope.orders[found].deliveryTime = payload[i].deliveryTime;
			}
		});
		$scope.$apply();
	};

	$scope.onDone = function(customer) {
		socket.send(JSON.stringify(
			{
				method: 'orderDone',
				params: {
					customer: customer
				}
			}
		));

		var found = findIndexOf($scope.orders, function(element) {
			if (order.customer === element.customer) {
				return 1;
			} else {
				return 0;
			}
		});

		if (found === -1) {
			return;
		}

		$scope.orders.splice(found, 1);
	};
}])

.factory('findIndexOf', function() {
	return function(array, predicate) {
		for (var i=0; i<array.length; i++) {
			var element = array[i];
			if (predicate(element)) {
				return i;
			}
		}
		return -1;
	};
});

