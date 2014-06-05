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

.controller('PurchaseCtrl', function($scope, $http, $location, $ionicPopup) {
	
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
					sendRequest();
				}
			});
		} else {
			sendRequest();
		}

		function sendRequest() {
			$http.post('http://128.193.36.250/item', {
				customer: $scope.settings.name,
				items: $scope.selectedItems
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

