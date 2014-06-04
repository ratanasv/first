angular.module('vir.customer', [
	'templates-app',
	'templates-common',
	'ui.router',
	'vir.customer.purchase',
	'vir.customer.countdown',
	'vir.customer.settings',
	'ionic'
])

.config( function myAppConfig ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.when('/customer', '/customer/settings');
	$stateProvider.state( 'customer' , {
		url: '/customer',
		views: {
			'main': {
				controller: 'CustomerCtrl',
				templateUrl: 'customer/customer.tpl.html'
			}
		},
		data: {
			pageTitle: 'Customer'
		}
	});
})

.controller('CustomerCtrl', function AppCtrl($scope) {
	$scope.settings = {};
	$scope.selectedItems = [];
});

