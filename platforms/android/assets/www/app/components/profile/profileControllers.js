angular.module('gymker.profilecontrollers', [])

.controller('ProfileController', ['$scope', '$ionicPopover', 'AuthService', 'UserRepository',
                                  function($scope, $ionicPopover, AuthService, UserRepository){
	
	$scope.user;
	
	AuthService.getUser(function(error, result){
		$scope.$apply(function (){
			if(!error){
				$scope.user = result;
			}
		});
	});
	
	$scope.newImageSrc;
	
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
	
}]);