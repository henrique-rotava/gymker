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
	
	$scope.acceptContact = function(notification){
		UserRepository.acceptRelationship(notification.relation, function(error, result){
			console.log(result);
			notification.status = 'accepted';
			NotificationRepository.update(notification, function(erro, result){
				$scope.$apply(function(){
					$scope.notification = result;
				});
			});
		});
	};
	
	$scope.rejectContact = function(notification){
		UserRepository.rejectRelationship(notification.relation, function(error, result){
			console.log(result);
			notification.status = 'rejected';
			NotificationRepository.update(notification, function(erro, result){
				$scope.$apply(function(){
					$scope.notification = result;
				});
			});
		});
	};
	
}]);