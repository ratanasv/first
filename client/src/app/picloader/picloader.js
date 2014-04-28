angular.module('vir.picloader', [

])

.config(function($stateProvider) {
	$stateProvider.state( 'picloader' , {
		url: '/picloader',
		views: {
			'main': {
				controller: 'PicLoaderCtrl',
				templateUrl: 'picloader/picloader.tpl.html'
			}
		},
		data: {
			pageTitle: 'Picture Loader'
		}
	});

})

.controller('PicLoaderCtrl', function($scope, $http, $location) {
	$scope.submit = function() {
		if (!$scope.picLoaderForm.picture.$valid) {
			return alert('not a valid form');
		}

		$http({
			url: '/picloader',
			method: 'POST',
			params: {
				university: $scope.university
			}
		})
		.success(function(data, status, headers, config) {
			alert(JSON.stringify(data));
		})
		.error(function(data, status, headers, config) {
			alert('error: ' + data);
		});
	};
}
);

