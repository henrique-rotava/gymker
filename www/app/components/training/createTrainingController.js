angular.module('gymker.trainingcontrollers')

.controller('CreateTrainingController', 
			['$rootScope', '$scope', 'ExerciceRepository', 'UserRepository', 'TrainingRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($rootScope, $scope, ExerciceRepository, UserRepository, TrainingRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	
	$scope.exercices = [];
    $scope.search = "";
    $scope.training = {days:{}};
    $scope.letters = ['A','B','C','D','E','F','G'];
    $scope.exerciceDays = {};
    
    $rootScope.$watch('user', function(){
		if($rootScope.user){
			$scope.training.coach = $rootScope.user,
			$scope.training.athlete = $rootScope.user
		}
    });

    var loadAthletes = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				UserRepository.getUserAthletes($rootScope.user, function(err, result){
					if(!err){
						$scope.relations = result;
					}
					$ionicLoading.hide();
				});
			}
		});
	}
	
	loadAthletes();
    
    var load = function(){
      ExerciceRepository.getAll(function(err, result){
        if(!err){
        	for(index in $scope.letters){
        		$scope.exerciceDays[$scope.letters[index]] = angular.copy(result);
        	}
        }
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
		
		texercice = angular.copy(exercice);
		texercice.intensity = texercice.intensity || {};
		texercice.intensity.series = texercice.intensity.series || 0;
		texercice.intensity.repetitions = texercice.intensity.repetitions || 0;
		texercice.intensity.weight = texercice.intensity.weight || 0;
		
		$scope.exercice = texercice;
		
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
		
		if(exercice.selected){
			$scope.configExercice(exercice);
			addExercice(exercice, letter);
		} else {
			removeExercice(exercice, letter);
		}
	}
	
	var lastSelection;
	$scope.selectUser = function(relation){
		relation.selected = true;
		if(lastSelection){
			lastSelection.selected = false;
		}
		lastSelection = relation;
		$scope.training.athlete = relation.related;
		$scope.nextStep();
		$ionicLoading.show({ 
            template: 'Aluno ' + relation.related.name + ' selecionado.',
            noBackdrop: true,
            duration: 2000
        });
	};
	
	var addExercice = function(exercice, letter){
		if(!$scope.training.days[letter]){
			$scope.training.days[letter] = {};
		}
		if(!$scope.training.days[letter].trainingExercices){
			$scope.training.days[letter].trainingExercices = {};
		}
		$scope.training.days[letter].trainingExercices[exercice.id] = exercice;
	};
	
	var removeExercice = function(exercice, letter){
		delete $scope.training.days[letter].exercices[exercice.id];
	}
	
	$scope.increase = function(prop){
		var actualValue = parseFloat($scope.exercice.intensity[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else {
			++actualValue;
		}
		$scope.exercice.intensity[prop] = actualValue;
	};
	
	$scope.decrease = function(prop){
		var actualValue = parseFloat($scope.exercice.intensity[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else if(actualValue - 1 > 0){
			--actualValue
		}
		$scope.exercice.intensity[prop] = actualValue;
	};
	
	/* Slider controllers */
	$scope.previousStep = function(){
		$ionicSlideBoxDelegate.previous();
	};
	$scope.nextStep = function(){
		$ionicSlideBoxDelegate.next();
	};
	$scope.hasPrevious = function(){
		return $ionicSlideBoxDelegate.currentIndex() > 0;
	};
	$scope.hasNext = function(){
		return $ionicSlideBoxDelegate.currentIndex() < $ionicSlideBoxDelegate.count() - 1;
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
	
	$scope.saveTraining = function(){
		console.log($scope.training);
		TrainingRepository.save($scope.training);
	};
	
}]);
