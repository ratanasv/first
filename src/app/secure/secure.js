angular.module('vir.secure', [

])

.config(function($stateProvider) {
	$stateProvider.state( 'secure' , {
		url: '/secure',
		views: {
			'main': {
				controller: 'SecureCtrl',
				templateUrl: 'secure/secure.tpl.html'
			}
		},
		data: {
			pageTitle: 'Secure'
		}
	});

})

.controller('SecureCtrl', function($scope, $http, $location) {
	$http({
		url: '/secure',
		method: 'GET'
	})
	.success(function(data, status, header, config) {
		$scope.user = data;
	})
	.error(function(data, status, header, config) {
		alert('Not logged in.');
	});
}
);

