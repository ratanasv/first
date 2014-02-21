angular.module( 'ngBoilerplate', [
	'templates-app',
	'templates-common',
	'ngBoilerplate.home',
	'ngBoilerplate.about',
	'ui.state',
	'ui.route',
	'ui.bootstrap',
	'ngBoilerplate.vistas'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
	$urlRouterProvider.otherwise( 'vistas' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		if ( angular.isDefined( toState.data.pageTitle ) ) {
			$scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
		}
	});
});

