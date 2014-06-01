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
	$scope.items = {
		'donut' : {
			image: 'assets/donut.jpg',
			name: 'Donut',
			description: 'A sweet baked item'
		},
		'coffee' : {
			image: 'assets/coffee.jpg',
			name: 'Coffee',
			description: 'Increase productivity'
		},
		'sandwich' : {
			image: 'assets/sandwich.jpg',
			name: 'Sandwich',
			description: 'Bread with things in the middle'
		}
	};
	
	$scope.toggleSelection = function(id) {
		if ($scope.items[id].selected === undefined) {
			return $scope.items[id].selected = true;
		}
		$scope.items[id].selected = !$scope.items[id].selected;
	};

	$scope.onDone = function() {
		alert('done!!!');
	};
});

