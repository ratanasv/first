angular.module('vir.purchase', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ngTouch'
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
	$scope.items = ['apple', 'orange', 'banana'];
	$scope.activeItemNo = 0;
	$scope.activeItem = $scope.items[$scope.activeItemNo];
	$scope.onSwipeRight = function() {
		$scope.activeItemNo = ($scope.activeItemNo + 1) % $scope.items.length;
		$scope.activeItem = $scope.items[$scope.activeItemNo];
	};
	$scope.onSwipeLeft = function() {
		$scope.activeItemNo = ($scope.activeItemNo - 1) % $scope.items.length;
		$scope.activeItem = $scope.items[$scope.activeItemNo];
	};
	
});

