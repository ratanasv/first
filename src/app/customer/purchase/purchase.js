angular.module('vir.customer.purchase', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'customer.purchase' , {
		url: '/purchase',
		views: {
			'customer': {
				controller: 'PurchaseCtrl',
				templateUrl: 'customer/purchase/purchase.tpl.html'
			}
		},
		data: {
			pageTitle: 'Purchase'
		}
	});

})

.controller('PurchaseCtrl', function($scope, $http, $location, showNamePrompt) {
	
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

		showNamePrompt($scope, sendRequest);

		function sendRequest() {
			$http.post('http://128.193.36.250/item', {
				customer: $scope.settings.name,
				items: $scope.selectedItems,
				distance: $scope.settings.distance
			})
			.success(function(data, status, headers, config) {
				$location.url('/customer/countdown');
			})
			.error(function(data, status, headers, config) {
				alert('error: ' + data);
			});
		}

	};
});

