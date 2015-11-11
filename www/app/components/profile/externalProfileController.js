angular.module('profilecontrollers')

.controller('ExternalProfileController', ['$rootScope','$scope', '$stateParams', 'ExecutionRepository','UserRepository', 'NotificationRepository', '$ionicModal','$ionicLoading',
                                  function($rootScope, $scope, $stateParams, ExecutionRepository, UserRepository, NotificationRepository, $ionicModal, $ionicLoading){
	
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	function startUp(){
		
		$scope.notification = {};
		
		$scope.externalUser = {};
		function loadExecutions(user){
			ExecutionRepository.getExecutionsByUser(user, function(error, result){
				if(!error){
					$scope.$apply(function(){
						$scope.executions = result;
					});
				}
			});
		}
		
		var userId = $stateParams.userId;
		UserRepository.get(userId, function(error,result){
			$scope.$apply(function(){
				$scope.externalUser = result;
				loadExecutions(result);
			});
		});
	}
	
	$ionicModal.fromTemplateUrl('templates/send-notification.html', {
		 scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.writeNotification = function() {
		$scope.modal.show();
	};
	
	
	$scope.sendNotification = function(){
		
		var notification = {
			title: $scope.notification.title,
			link: '#/app/profile/message-notification/',
			message: $scope.notification.message,
			createdDate: new Date(),
			notificationType: 'message'
		};
		
		NotificationRepository.save($rootScope.user.id, $scope.externalUser.id, notification, function(error, result){
			if(!error){
				$scope.notification = {};
				$rootScope.user = result;
				showMessage('Notificação enviada com sucesso.');
				$scope.modal.hide();
			} else {
				showMessage('Occoreu um erro ao enviar a notificação.');
			}
		});
		
		function showMessage(message){
			$ionicLoading.show({
				template: message,
				duration: 2000
			});
		};
		
	}
	
}]);