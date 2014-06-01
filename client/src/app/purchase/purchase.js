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
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	
});

