angular.module('notificationcontrollers')

.controller('ListNotificationsController', ['$rootScope', '$scope', '$ionicLoading', 'NotificationRepository', 'AuthService',
                                            function($rootScope, $scope, $ionicLoading, NotificationRepository, AuthService){
	
	$scope.$on('$ionicView.enter', function() {
		AuthService.getUser(function(error, result){
			if(!error){
				$rootScope.user = result;
				$scope.loadNotifications();
			}
		});
	});
	
	$scope.loaded = false;
	$scope.readLoaded = false;
	
	$scope.loadNotifications = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		
		function loadReadNotifications(){
			$scope.readLoaded = false;
			NotificationRepository.get($rootScope.user.readNotifications, function(error, result){
				if(!error){
					$scope.$apply(function(){
						$rootScope.user.readNotifications = result;
						$scope.readLoaded = true;
					});
				}
			});
			
			$scope.loaded = true;
			$ionicLoading.hide();
		}
		
		if($rootScope.user){
			loadReadNotifications();
		}else{
			$rootScope.$watch('user', function(){
				if($rootScope.user){
					loadReadNotifications();
				}
			});
		}
	}
	
	$scope.refresh = function(){
		$scope.loadNotifications();
	};
	
	$scope.readNotification = function(notification){
		NotificationRepository.read($rootScope.user, notification, function(error, result){
			if(!error){
				$rootScope.user = result;
				$scope.loadNotifications();
			}
			console.log(result);
		});
	}
	
	$scope.getNotificationIcon = function(notification){
		var icons = {
			relation: 'ion-ios-person',
			training: 'ion-android-walk',
			message: 'ion-android-chat'
		}
		return icons[notification.notificationType];
	};
	
}]);