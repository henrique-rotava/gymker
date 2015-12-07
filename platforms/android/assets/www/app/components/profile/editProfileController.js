angular.module('profilecontrollers')

.controller('EditProfileController', ['$rootScope', '$scope', '$ionicPopover', 'AuthService', 'UserRepository', '$ionicLoading', '$timeout',
                                  function($rootScope, $scope, $ionicPopover, AuthService, UserRepository, $ionicLoading, $timeout){

	$scope.$on('$ionicView.enter', function() {
		startUp();
	});

	var startUp = function(){
		if($rootScope.user){
			$scope.formUser = angular.copy($rootScope.user);
			$scope.formUser.address = $scope.formUser.address || {};
		}else{
			$rootScope.$watch('user', function(){
				$scope.formUser = angular.copy($rootScope.user);
				$scope.formUser.address = $scope.formUser.address || {};
			});
		}
		$scope.birthDateType = 'text';
		$scope.newImageSrc;
		$scope.inputPasswordType = 'password';
		$scope.errors = {};
	}

	$scope.togglePassword = function(){
		if($scope.inputPasswordType == 'password'){
			$scope.inputPasswordType = 'text';
		}else{
			$scope.inputPasswordType = 'password';
		}
	};

	// workaround for input[type=date]
	$scope.updateBirthDateType = function(type){
		if(type){
			$scope.birthDateType = type;
		}else{
			$scope.birthDateType = $scope.formUser.birthDate ? 'date' : 'text';
		}
	}

	$ionicPopover.fromTemplateUrl('templates/profile/choose-pic-type.html', {
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
		$rootScope.user.profilePic = $scope.newImageSrc;
		$scope.closePopover();
		UserRepository.save($rootScope.user, function(error, result){
			if(!error){
				$rootScope.user = result;
				$scope.user = angular.copy(result);
			}
		});
	};

	$scope.closePopover = function(){
		$scope.newImageSrc = "";
		$scope.popover.hide();
	};

	$scope.updateProfile = function(formUser) {
		UserRepository.save(formUser, function(error, result){
			if(!error){
				$ionicLoading.show({
		            template: 'Perfil atualizado com sucesso!',
		            noBackdrop: true,
		            duration: 2000
		        });

				$rootScope.user = result;
				$scope.formUser = angular.copy($rootScope.user);

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

	var validateEmailTimeout;
	var validatePhoneTimeout;
	var validateCREFTimeout;

	var validateKeys = function(value, property, required, regex, timeout, suffix){
		$timeout.cancel(timeout);

		console.log('changed', value);

		if(!required && (!value || value.length == 0)){
			$scope.errors[property] = '';
			console.log('empty valid');
			return;
		}

		if(value != $scope.user[property]){

			timeout = $timeout(function(){

				if(regex && !regex.test(value)){
					console.log('not valid');
					$scope.$apply(function(){
						$scope.errors[property] = suffix + ' inválido';
					});
					return;
				}else{
					console.log('valid');
					$scope.errors[property] = '';
				}

				console.log('validating on repository');
				UserRepository.validateUniqueKeys(value, function(error, result){
					$scope.$apply(function(){
						if(!result){
							$scope.errors[property] = suffix + ' já cadastrado';
						}
					});
				});
			}, 500);
		}

	}

	$scope.validateEmail = function(email){
		var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
		validateKeys(email, 'email', false, regex, validateEmailTimeout, 'Email');
	};

	$scope.validatePhone = function(phone){
		var regex = /[0-9]{8,15}/igm;
		validateKeys(phone, 'phone', false, regex, validatePhoneTimeout, 'Telefone');
	};

	$scope.validateCREF = function(cref){
    var regex = /[0-9]{6}-[A-Z]{1}\/[A-Z]{2}/igm;
		validateKeys(cref, 'cref', false, regex, validateCREFTimeout, 'CREF');
	};

}]);
