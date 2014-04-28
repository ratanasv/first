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
		$http({
			url: '/picloader',
			method: 'POST',
			params: {}
		})
		.success(function(data, status, headers, config) {
			alert('success!');
		})
		.error(function(data, status, headers, config) {
			alert('error: ' + data);
		});
	};
}
);

