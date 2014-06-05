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
})

.factory('showNamePrompt', function($ionicPopup) {
	return function($scope, callback) {
		if (!$scope.settings.name|| $scope.settings.name.length === 0) {
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
					callback();
				}
			});
		} else {
			callback();
		}
	};
});

