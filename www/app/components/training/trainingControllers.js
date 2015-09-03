angular.module('gymker.trainingcontrollers', ['gymker.exerciceservices'])

.controller('TrainingController', 
			['$scope', 'ExerciceRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($scope, ExerciceRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	
	$scope.exercices = [];
    $scope.search = "";
	
    $ionicLoading.show({ 
        template: 'Carregando...'
    });
    
    var load = function(){
      ExerciceRepository.getAll(function(err, result){
        if(!err){
          $scope.exercices = result;
        }
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    load();
    
    $scope.refresh = function(){
        load();
    }
	
	$scope.configExercice = function(exercice){
		
		if(!exercice.selected){
			return;
		}
		
		$scope.exercice = angular.copy(exercice);
		
		$scope.exercice.series = $scope.exercice.series || 0;
		$scope.exercice.repetitions = $scope.exercice.repetitions || 0;
		$scope.exercice.weight = $scope.exercice.weight || 0;
		
		var exerciceOptionsPopup = $ionicPopup.show({
			templateUrl: 'templates/exercices/exercice-intensity-popup.html' ,
			title: exercice.name,
			scope: $scope,
			buttons: [
	           { 
	        	   text: 'Depois' ,
	        	   type: 'button-balanced button-clear'
	           },
	           { 
	        	   text: 'Salvar',
	        	   type: 'button-balanced button-clear',
	        	   onTap: function(e){
	        		   angular.copy($scope.exercice, exercice);
	        	   }
	        	   
	           }
			]
		});
	}
	
	$scope.increase = function(prop){
		var actualValue = parseFloat($scope.exercice[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else {
			++actualValue;
		}
		$scope.exercice[prop] = actualValue;
	};
	
	$scope.decrease = function(prop){
		var actualValue = parseFloat($scope.exercice[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else if(actualValue - 1 > 0){
			--actualValue
		}
		$scope.exercice[prop] = actualValue;
	};
	
	/* Slider controllers */
	$scope.previousStep = function(){
		$ionicSlideBoxDelegate.previous();
	};
	
	$scope.nextStep = function(){
		$ionicSlideBoxDelegate.next();
	};

	/* Fake tabs */
	var letters = ['A','B','C','D','E','F','G'];
	$scope.selectedTraining = {};
	var clearTrainingSelection = function(){
		for(index in letters){
			$scope.selectedTraining[letters[index]] = 'button-dark';
		}
	}
	clearTrainingSelection();
	$scope.selectedTrainingLetter = 'A';
	$scope.selectedTraining[$scope.selectedTrainingLetter] = 'button-balanced';
	$scope.selectTraining = function(letter){
		clearTrainingSelection();
		$scope.selectedTrainingLetter = letter;
		$scope.selectedTraining[$scope.selectedTrainingLetter] = 'button-balanced';
	};
	
}]);
