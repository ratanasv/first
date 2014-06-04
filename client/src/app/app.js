angular.module( 'ngBoilerplate', [
  'templates-app',
  'templates-common',
  'ui.router',
  'vir.customer',
  'vir.barista',
  'ionic'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/customer' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | KEC Online Order' ;
    }
  });
  $scope.items = {
    'donut' : {
      image: 'assets/donut.jpg',
      name: 'Donut',
      description: 'A sweet baked item',
      cost: 1
    },
    'coffee' : {
      image: 'assets/coffee.jpg',
      name: 'Coffee',
      description: 'Increase productivity',
      cost: 2.6
    },
    'sandwich' : {
      image: 'assets/sandwich.jpg',
      name: 'Sandwich',
      description: 'Bread with things in the middle',
      cost: 6.12
    },
    'tea' : {
      image: 'assets/tea.jpg',
      name: 'Tea',
      description: 'Coffee is better',
      cost: 1.1
    },
    'apple' : {
      image: 'assets/apple.jpg',
      name: 'Apple',
      description: 'yup...',
      cost: 0.5
    },
    'brownie' : {
      image: 'assets/brownie.jpg',
      name: 'Brownie',
      description: 'asdf qwer zxcv',
      cost: 3.14
    }
  };
});

