angular.module('gymker.profilecontrollers', [])

.controller('ProfileController', ['$scope', '$ionicPopover', 'AuthService', 'UserRepository', '$ionicLoading',
                                  function($scope, $ionicPopover, AuthService, UserRepository, $ionicLoading){
	
	$scope.user;
	$scope.formUser;
	$scope.newImageSrc;
	$scope.birthDateType = 'text';
	
	AuthService.getUser(function(error, result){
		$scope.$apply(function (){
			if(!error){
				$scope.user = result;
				$scope.formUser = angular.copy($scope.user);
				$scope.updateBirthDateType();
			}
		});
	});
	
	// workaround for input[type=date]
	$scope.updateBirthDateType = function(type){
		if(type){
			$scope.birthDateType = type;
		}else{
			$scope.birthDateType = $scope.formUser.birthDate ? 'date' : 'text';
		}
	}
	
	$ionicPopover.fromTemplateUrl('choose-pic-type.html', {
	    scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});
	
	$scope.openPictureType = function($event) {
		$scope.popover.show($event);
	};
		
	$scope.getPicture = function(source) {
		
		var cameraOptions = {
			sourceType: source,
			destinationType: Camera.DestinationType.DATA_URL,
			saveToPhotoAlbum: false,
			quality : 50
		};
		
		var cameraSuccess = function(imageData) {
			 $scope.$apply(function (){
				 $scope.newImageSrc = 'data:image/jpeg;base64,' + imageData
			 });
		};
		
		var cameraError = function(message){
			console.log(error);
		};
		
		navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
	};
	
	$scope.saveNewPic = function(){
		$scope.user.profilePic = $scope.newImageSrc;
		$scope.closePopover();
		UserRepository.save($scope.user);
	};
	
	$scope.closePopover = function(){
		$scope.newImageSrc = "";
		$scope.popover.hide();
	};
	
	$scope.updateProfile = function(formUser) {
		$scope.user = angular.copy(formUser);
		UserRepository.save($scope.user, function(error, result){
			if(!error){
				$ionicLoading.show({ 
		            template: 'Perfil atualizado com sucesso!',
		            noBackdrop: true,
		            duration: 1000
		        });
				
				$scope.user._rev = result.rev;
				$scope.formUser = angular.copy($scope.user);
				
			}else{
				console.log(result);
				$ionicLoading.show({ 
		            template: 'Ops, ocorreu um erro ao salvar suas informações.',
		            noBackdrop: true,
		            duration: 1000
		        });
			}
		});
	};
	
}]);