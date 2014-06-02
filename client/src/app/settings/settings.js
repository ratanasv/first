angular.module('vir.settings', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'settings' , {
		url: '/settings',
		views: {
			'main': {
				controller: 'SettingsCtrl',
				templateUrl: 'settings/settings.tpl.html'
			}
		},
		data: {
			pageTitle: 'Settings'
		}
	});

})

.controller('SettingsCtrl', function($scope) {
	
});

