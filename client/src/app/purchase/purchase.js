angular.module('vir.purchase', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'purchase' , {
		url: '/purchase',
		views: {
			'main': {
				controller: 'PurchaseCtrl',
				templateUrl: 'purchase/purchase.tpl.html'
			}
		},
		data: {
			pageTitle: 'Purchase'
		}
	});

})

.controller('PurchaseCtrl', function($scope, $http, $location) {
	$scope.customer = {};
	$scope.items = {
		'donut' : {
			image: 'assets/donut.jpg',
			name: 'Donut',
			description: 'A sweet baked item',
			cost: 1
		},
		'coffee' : {
			image: 'assets/coffee.jpg',
			name: 'Coffee',
			description: 'Increase productivity',
			cost: 2.6
		},
		'sandwich' : {
			image: 'assets/sandwich.jpg',
			name: 'Sandwich',
			description: 'Bread with things in the middle',
			cost: 6.12
		}
	};
	$scope.selectedItems = [];
	
	$scope.toggleSelection = function(id) {
		if ($scope.items[id].selected === undefined) {
			$scope.items[id].selected = true;
		} else {
			$scope.items[id].selected = !$scope.items[id].selected;
		}
		
		if ($scope.items[id].selected) {
			$scope.selectedItems.push(id);
		} else {
			var foundItem = $scope.selectedItems.indexOf(id);
			$scope.selectedItems.splice(foundItem, 1);
		}
	};

	$scope.totalCost = function() {
		var totalCost = 0.0;
		for (var i=0; i<$scope.selectedItems.length; i++) {
			var id = $scope.selectedItems[i];
			totalCost += $scope.items[id].cost;
		}
		return totalCost;
	};

	$scope.onDone = function() {
		if ($scope.selectedItems.length === 0) {
			return alert('your order is empty!');
		}

		if ($scope.customer.length === 0) {
			return alert('input valid name');
		}

		$http.post('/item', {
			customer: $scope.customer.name,
			items: $scope.selectedItems
		})
		.success(function(data, status, headers, config) {
			alert('delivery: ' + data.deliveryTime);
			$location.url('/countdown');
		})
		.error(function(data, status, headers, config) {
			alert('error: ' + data);
		});
	};
});

