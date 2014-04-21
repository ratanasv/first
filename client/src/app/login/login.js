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

.controller('LoginCtrl', function($scope) {
	$scope.isOkay = false;

	$scope.submit = function() {
		alert(JSON.stringify($scope.user));
	};
});

