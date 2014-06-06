angular.module('vir.login', [

])

.config(function($stateProvider) {
	$stateProvider.state( 'login' , {
		url: '/login',
		views: {
			'main': {
				controller: 'LoginCtrl',
				templateUrl: 'login/login.tpl.html'
			}
		},
		data: {
			pageTitle: 'Login'
		}
	});

})

.controller('LoginCtrl', function($scope, $http, $location) {
	$scope.isOkay = false;

	$scope.submit = function() {
		$http({
			url: '/login',
			method: 'POST',
			params: {
				username: $scope.user.name,
				password: $scope.user.password
			}
		})
		.success(function(data, status, headers, config) {
			$location.url('/secure');
		})
		.error(function(data, status, headers, config) {
			alert('error: ' + data);
		});
	};
}
);

