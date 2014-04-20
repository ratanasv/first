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

	.controller('CollapseCtrl', function CollapseCtrl($scope) {
		$scope.isCollapsed = false;
	})

	.controller( 'VISTASCtrl', function VISTASCtrl( $scope ) {
		// This is simple a demo for UI Boostrap.
		$scope.dropdownDemoItems = [
			"The first choice!",
			"And another choice for you.",
			"but wait! A third!"
		];

		$scope.carouselInterval = 4000;
		var slides = [
			{
				image: 'assets/idaho.png',
				header: 'Visual Analytics Software',
				text: 'enable scientists to better understand and communicate about large and complex' + 
					'environmental problems that span spatial and temporal scales'
			},
			{
				image: 'assets/eugene.png',
				header:'Ecology Informatics Research',
				text: 'enable the required visual analytics and implement a proof of concept software tool'
			}
		];
		$scope.slides = slides;
	})



;
