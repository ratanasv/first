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

		if (!$scope.settings.name || $scope.settings.name.length === 0) {
			return alert('input valid name');
		}

		$http.post('http://128.193.36.250/item', {
			customer: $scope.settings.name,
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

