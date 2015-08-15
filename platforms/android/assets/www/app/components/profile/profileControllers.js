angular.module('gymker.profilecontrollers', [])

.controller('ProfileController', ['$scope', '$ionicPopover', function($scope, $ionicPopover){
	
	$scope.imageSrc = "/resources/icon.png";
	
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
			$scope.imageSrc = 'data:image/jpeg;base64,' + imageData;
		};
		
		var cameraError = function(message){
			console.log(error);
		};
		
		navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
		
		
	};
	
}]);