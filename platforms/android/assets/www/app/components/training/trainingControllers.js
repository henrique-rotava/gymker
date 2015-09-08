angular.module('gymker.trainingcontrollers', ['gymker.exerciceservices'])

.controller('TrainingController', 
			['$rootScope', '$scope', 'ExerciceRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($rootScope, $scope, ExerciceRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	
	$scope.exercices = [];
    $scope.search = "";
    $scope.training = {days:{}, coach: $rootScope.user};
    $scope.letters = ['A','B','C','D','E','F','G'];
    $scope.exerciceDays = {};
	
    $ionicLoading.show({
        template: 'Carregando...'
    });
    
    var load = function(){
      ExerciceRepository.getAll(function(err, result){
        if(!err){
        	for(index in $scope.letters){
        		$scope.exerciceDays[$scope.letters[index]] = angular.copy(result);
        	}
        }
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    
    $scope.getExerciceDay = function(letter){
    	return $scope.exerciceDays[letter];
    };
    
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
	};
	
	$scope.selectExercice = function(exercice, letter){
		$scope.configExercice(exercice);
		
		if(exercice.selected){
			addExercice(exercice, letter);
		} else {
			removeExercice(exercice, letter);
		}
	}
	
	$scope.selectUser = function(user){
		$scope.training.athlete = user;
	};
	
	var addExercice = function(exercice, letter){
		if(!$scope.training.days[letter]){
			$scope.training.days[letter] = {};
		}
		$scope.training.days[letter][exercice.id] = exercice;
		console.log($scope.training);
	};
	
	var removeExercice = function(exercice, letter){
		delete $scope.training.days[letter][exercice.id];
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
	$scope.selectedTraining = 'A';
	$scope.selectedTrainings = {};
	$scope.selectedTrainings['A'] = true;
	$scope.selectTraining = function(letter){
		$scope.selectedTraining = letter;
		$scope.selectedTrainings[letter] = true;
	};
	$scope.wasSelected = function(letter){
		return !!$scope.selectedTrainings[letter];
	};
	
}]);
