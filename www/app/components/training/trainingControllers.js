angular.module('gymker.trainingcontrollers', ['gymker.exerciceservices'])

.controller('TrainingController', 
			['$rootScope', '$scope', 'ExerciceRepository', 'UserRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($rootScope, $scope, ExerciceRepository, UserRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	
	$scope.exercices = [];
    $scope.search = "";
    $scope.training = {days:{}, coach: $rootScope.user};
    $scope.letters = ['A','B','C','D','E','F','G'];
    $scope.exerciceDays = {};

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
		console.log($ionicSlideBoxDelegate);
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
	
}]);
