angular.module('notificationcontrollers')

.controller('ShowContactNotificationController', 
		['$rootScope', '$scope', '$ionicLoading', 'NotificationRepository', '$stateParams', 'UserRepository',
		 function($rootScope, $scope, $ionicLoading, NotificationRepository, $stateParams, UserRepository){
	
	$ionicLoading.show({
        template: 'Carregando...'
    });
	
	NotificationRepository.get($stateParams.notificationId, function(error, result){
		if(!error){
			$scope.notification = result;
		}
		$ionicLoading.hide();
	});
	
	$scope.acceptContact = function(relationId){
		UserRepository.acceptRelationship(relationId, function(error, result){
			console.log(result);
		});
	};
	
	$scope.rejectContact = function(relationId){
		UserRepository.rejectRelationship(relationId, function(error, result){
			console.log(result);
		});
	};
	
}]);