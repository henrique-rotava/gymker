angular.module('profilecontrollers')

.controller('AuthController', ['$rootScope', '$scope', '$ionicModal', 'UserRepository', '$ionicPopup','AuthService',
                               function($rootScope, $scope, $ionicModal, UserRepository, $ionicPopup, AuthService){
	$scope.loginData = {};
	 
	$ionicModal.fromTemplateUrl('templates/login.html', {
		 scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	$scope.login = function() {
		$scope.modal.show();
	};
	
	$scope.logout = function(){
		AuthService.logout(function(error, result){
			if(!error){
				$scope.$apply(function(){
					$rootScope.user = result;
				});
			}
		});
	};
	
	var showAlert = function(message) {
		var alertPopup = $ionicPopup.alert({
			title: 'Usuário não encontrado',
			template: message,
			buttons: [
	           {
	        	   text: 'OK' ,
	        	   type: 'button-balanced button-clear'
	           }
		    ]
		});
	};

	$scope.doLogin = function() {
		UserRepository.login($scope.loginData.username, $scope.loginData.password, function(error, result){
			if(!error){
				console.log(result);
				AuthService.populateSession(result);
				$scope.closeLogin();
			}else if(error && result.code == '404'){
				showAlert('Verfique as informações de autenticação informadas.');
			}else{
				showAlert('Ocorreu um erro ao tentar realizar a autenticação.');
			}
		});
	};
}]);