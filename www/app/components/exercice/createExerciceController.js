angular.module('exercicecontrollers')

.controller('CreateExerciceController', 
    ['$scope', '$ionicLoading', 'ExerciceRepository','$ionicPopover',
     function($scope, $ionicLoading, ExerciceRepository, $ionicPopover){

	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
    
	var startUp = function(){
		$scope.exercice = {};
		$scope.errors = {};
		
		ExerciceRepository.getMuscles(function(error, result){
			console.log(result);
			if(!error){
				$scope.$apply(function(){
					$scope.muscles = result.muscles.sort();
				});
			}
		});
	};
	$scope.exerciceTypes = ['Tempo', 'Repetições'];

	var validateForm = function(){
		return $scope.validateName();
	}
	
	$scope.validateName = function(){
		if(!$scope.exercice.name){
			$scope.errors.name = 'O nome é requerido';
			return false;
		}else{
			delete $scope.errors.name;
		}
		return true;
	}
	
	$scope.createExercice = function(){
		
		if(validateForm()){
		
			ExerciceRepository.save($scope.exercice, function(error, result){
				if(!error){
					$ionicLoading.show({ 
						template: 'Exercício criado!',
						noBackdrop: true,
						duration: 2000
					});
					$scope.exercice = {};
				}else{
					$ionicLoading.show({ 
						template: 'Ocorreu um erro durante a criação do exercício.',
						noBackdrop: true,
						duration: 2000
					});
				}
			});
		
		}
	};
	
	// Image functions
	
	$ionicPopover.fromTemplateUrl('templates/profile/choose-pic-type.html', {
	    scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});
	
	$scope.openPictureType = function($event) {
		$scope.popover.show($event);
	};
	
	$scope.closePopover = function(){
		$scope.newImageSrc = "";
		$scope.popover.hide();
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
		$scope.exercice.image = $scope.newImageSrc;
		$scope.closePopover();
	};

}])