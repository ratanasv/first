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

		$scope.carouselInterval = 2000;
		var slides = $scope.slides = [];
		$scope.addSlide = function() {
			var newWidth = 600 + slides.length;
			slides.push({
				image: 'http://placekitten.com/' + newWidth + '/300',
				text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
					['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
			});
		};
		for (var i=0; i<4; i++) {
			$scope.addSlide();
		}
	})

;
