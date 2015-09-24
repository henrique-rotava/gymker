angular.module('notificationcontrollers')

.controller('ListNotificationsController', ['$rootScope', '$scope', '$ionicLoading',
                                            function($rootScope, $scope, $ionicLoading){
	
	$scope.loaded = false;
	
	$scope.loadNotifications = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				
				$scope.loaded = true;
				$ionicLoading.hide();
				
			}
		});
	}
	
	$scope.loadNotifications();
	
}]);