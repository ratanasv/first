describe('PurchaseCtrl', function() {
	beforeEach(module('vir.purchase'));

	it('should pass a controller instantiation test', inject(function($controller, $rootScope) {
		var $scope = $rootScope.$new();
		var ctrl = $controller('PurchaseCtrl', {$scope: $scope});
		expect(ctrl).toBeTruthy();
	}));
});