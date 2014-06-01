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
	$scope.items = [
		{
			image: 'assets/donut.jpg',
			name: 'Donut',
			description: 'A sweet baked item'
		},
		{
			image: 'assets/coffee.jpg',
			name: 'Coffee',
			description: 'Increase productivity'
		},
		{
			image: 'assets/sandwich.jpg',
			name: 'Sandwich',
			description: 'Bread with things in the middle'
		},
		{
			image: 'assets/donut.jpg',
			name: 'Donut',
			description: 'A sweet baked item'
		},
		{
			image: 'assets/coffee.jpg',
			name: 'Coffee',
			description: 'Increase productivity'
		},
		{
			image: 'assets/sandwich.jpg',
			name: 'Sandwich',
			description: 'Bread with things in the middle'
		},
		{
			image: 'assets/donut.jpg',
			name: 'Donut',
			description: 'A sweet baked item'
		},
		{
			image: 'assets/coffee.jpg',
			name: 'Coffee',
			description: 'Increase productivity'
		},
		{
			image: 'assets/sandwich.jpg',
			name: 'Sandwich',
			description: 'Bread with things in the middle'
		}
	];
	
	$scope.onClick = function(name) {
		alert('you click ' + name);
	};
});

