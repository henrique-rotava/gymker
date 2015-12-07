angular.module('gymker.trainingcontrollers')

.controller('CreateTrainingController',
			['$timeout', '$rootScope', '$scope', 'ExerciceRepository', 'UserRepository', 'TrainingRepository', 'NotificationRepository', '$ionicPopup', '$ionicLoading', '$ionicSlideBoxDelegate',
			function($timeout, $rootScope, $scope, ExerciceRepository, UserRepository, TrainingRepository, NotificationRepository, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate){
	var isTeacher = false;
	$rootScope.$watch('user', function(){
		$ionicSlideBoxDelegate.update();
	});

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
					isTeacher = $rootScope.user.isTeacher;
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
				UserRepository.getUserRelations($rootScope.user, 'athletes', function(err, result){
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
		texercice.intensity.time = texercice.intensity.time || 0;

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
		console.log(exercice.selected);
		if(exercice.selected){
			$scope.configExercice(exercice);
			addExercice(exercice, letter);
		} else {
			removeExercice(exercice, letter);
		}
	}

	var lastSelection = {};
	$scope.selectUser = function(relation){

		if(relation.selected){
			$scope.training.athlete = $rootScope.user;
		}else{
			lastSelection.selected = false;
			$scope.training.athlete = relation.related;
			lastSelection = relation;
		}

		relation.selected = !relation.selected;
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
		delete $scope.training.days[letter].trainingExercices[exercice.id];
		if(!Object.keys($scope.training.days[letter].trainingExercices).length){
			delete $scope.training.days[letter];
		}
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

		var reverseIndex = $ionicSlideBoxDelegate.count() - $ionicSlideBoxDelegate.currentIndex();
		var trainingHasExercice = Object.keys($scope.training.days).length > 0;
		var letGoOn = reverseIndex != 2 || trainingHasExercice;
		return index < $ionicSlideBoxDelegate.count() - 1 && letGoOn;
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

		$scope.training.createdDate = new Date();

		TrainingRepository.save($scope.training, function(error, result){

			if(!error){

				$rootScope.user = result;

				var coachId = $scope.training.coach.id || $scope.training.coach;
				var athleteId = $scope.training.athlete.id || $scope.training.athlete;

				if(coachId != athleteId){
					var notification = {
						title: 'Novo treino',
						link: '#/app/profile/training-notification/',
						message: $scope.training.message,
						createdDate: new Date(),
						training: $scope.training.id,
						notificationType: 'training'
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

	$scope.sendTraining = function(){
		return !($scope.training.coach.id == $scope.training.athlete.id);
	}

	startUp();

}]);
