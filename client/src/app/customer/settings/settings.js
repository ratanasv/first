angular.module('vir.customer.settings', [
	'ui.router',
	'templates-app',
	'templates-common',
	'ionic'
])

.config(function($stateProvider) {
	$stateProvider.state( 'customer.settings' , {
		url: '/settings',
		views: {
			'customer': {
				controller: 'SettingsCtrl',
				templateUrl: 'customer/settings/settings.tpl.html'
			}
		},
		data: {
			pageTitle: 'Settings'
		}
	});

})

.controller('SettingsCtrl', function($scope) {
	
});

