angular.module('gymker.trainingcontrollers')

.controller('CreateTrainingController', 
			['$timeout', '$rootScope', '$scope', 'ExerciceRepository', 'UserRepository', 'TrainingRepository', 'NotificationRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($timeout, $rootScope, $scope, ExerciceRepository, UserRepository, TrainingRepository, NotificationRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	
	var startUp = function(){
		$scope.exercices = [];
	    $scope.search = "";
	    $scope.training = {days:{}};
	    $scope.letters = ['A','B','C','D','E','F','G'];
	    $scope.exerciceDays = {};
	    
	    if(!$rootScope.user){
		    $rootScope.$watch('user', function(){
				if($rootScope.user){
					$scope.training.coach = $rootScope.user,
					$scope.training.athlete = $rootScope.user
				}
		    });
	    }else{
	    	$scope.training.coach = $rootScope.user;
			$scope.training.athlete = $rootScope.user;
	    }
	    loadAthletes();
	    loadExercices();
	    $ionicSlideBoxDelegate.slide(0);
	}

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
	
    var loadExercices = function(){
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
    
    $scope.refresh = function(){
    	loadExercices();
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
		
		TrainingRepository.save(angular.copy($scope.training), function(error, result){
			if(!error){
				
				$rootScope.user = result;
				
				var coachId = $scope.training.coach.id || $scope.training.coach;
				var athleteId = $scope.training.athlete.id || $scope.training.athlete;
				
				if(coachId != athleteId){
					var notification = {
						name: $scope.training.name,
						type: 'Novo treino',
						link: $scope.training.id,
						message: $scope.training.message
					};
					
					NotificationRepository.save(coachId, athleteId, notification, function(error, result){
						if(!error){
							$rootScope.user = result;
							showSuccessMessage();
						} else {
							showFailureMessage();
						}
					});
				} else {
					showSuccessMessage();
				}
				
			} else {
				showFailureMessage();
			}
		});
		
		function showFailureMessage(){
			$ionicLoading.show({
				template: 'Ocorreu um erro ao enviar o treino.',
				duration: 2000
			});
		};
		
		function showSuccessMessage(){
			startUp();
			$ionicLoading.show({
				template: 'Treino enviado com sucesso!',
				duration: 2000
			});
		};
		
	};
	
	startUp();
	
}]);
