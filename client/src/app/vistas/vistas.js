angular.module( 'ngBoilerplate.vistas', [
		'ui.state',
		'placeholders',
		'ui.bootstrap'
	])

	.config(function config( $stateProvider ) {
		$stateProvider.state( 'vistas', {
			url: '/vistas',
			views: {
				"main": {
					controller: 'VISTASCtrl',
					templateUrl: 'vistas/vistas.tpl.html'
				}
			},
			data:{ pageTitle: 'What is VISTAS?' }
		});
	})

	.controller( 'VISTASCtrl', function VISTASCtrl( $scope ) {
		// This is simple a demo for UI Boostrap.
		$scope.dropdownDemoItems = [
			"The first choice!",
			"And another choice for you.",
			"but wait! A third!"
		];
	})

;
