angular.module('gymker.trainingcontrollers')

.controller('ShowTrainingController',
			['$rootScope', '$scope', 'TrainingRepository','ExecutionRepository', 'ExerciceRepository', '$stateParams', '$ionicHistory', '$state', '$ionicLoading', '$ionicModal' ,'$ionicPopup',
			function($rootScope, $scope, TrainingRepository, ExecutionRepository, ExerciceRepository, $stateParams, $ionicHistory, $state, $ionicLoading, $ionicModal, $ionicPopup){


	$scope.$on('$ionicView.enter', function() {
		startUp();
	});

	$scope.training = {};

	var startUp = function(){
		$ionicLoading.show({
				template: 'Carregando...'
		});
		TrainingRepository.get($stateParams.trainingId, function(error, result){
			$ionicLoading.hide();
			if(!error){
				$scope.$apply(function(){
					$scope.training = result;
				});
				var day = $stateParams.day;
				if(day){
					for(index in $scope.training.days){
						if($scope.training.days[index].marker == day){
							$scope.$apply(function(){
								$scope.day = $scope.training.days[index];
								ExecutionRepository.getExecutionsByTrainingDay($scope.training.id, $scope.day.marker, function(error, result){
									if(!error){
										$scope.$apply(function(){
											$scope.executions = result;
										});
									}
								});
							});
						}
					}
				} else {
					ExecutionRepository.getExecutionsByTraining($scope.training, function(error, result){
						if(!error){
							$scope.$apply(function(){
								$scope.executions = result;
							});
						}
					});
				}
			}
		});


	}

	$scope.getDayExercicesMuscles = function(day){
		if(day){
			var muscles = {};
			var trainingExercices = day.trainingExercices;
			for(var index = 0; index < trainingExercices.length; index++){
				var muscle = trainingExercices[index].exercice.muscle;
				muscles[muscle] = '';
			}
			return Object.keys(muscles).join(', ');
		}
	};

	$scope.createExecutionTraining = function(training){
		ExecutionRepository.create($scope.day, $scope.training, $rootScope.user, function(error, result){
			if(!error){
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.execute-training-day', {executionId: result.id});
			}
		});
	};

	// Removing exercices //

	var removeSelection = {};
	$scope.selectExercice = function(trainingExercice){
		var exerciceId = trainingExercice.id;
		if(removeSelection[exerciceId]){
			delete removeSelection[exerciceId];
		}else{
			removeSelection[exerciceId] = true;
		}
	};

	$scope.removeSelection = function(){

		var trainingExercices = $scope.day.trainingExercices;
		var resultExercices = [];
		for(var index = 0; index < trainingExercices.length; index++){
			var exercice = trainingExercices[index];
			if(!removeSelection[exercice.id]){
				resultExercices.push(exercice);
			}
			$scope.day.trainingExercices = resultExercices;
		}

		TrainingRepository.updateTrainingDay($scope.day, function(error, result){
			if(!error){
				$scope.$apply(function(){
					$scope.day = result;
				});
			}
		});

		removeSelection = {};
		$scope.select = false;
	};

	// Adding exercices //

	$ionicModal.fromTemplateUrl('templates/training/update/list-exercices-to-add.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.closeSelection = function() {
		$scope.modal.hide();
	};

	$scope.openSelection = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		ExerciceRepository.getAll(function(err, result){
			$scope.exercices = result;
			$ionicLoading.hide();
		});
		$scope.modal.show();
	};

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

	var addSelection = {};
	$scope.selectExerciceToAdd = function(exercice){

		var exerciceId = exercice.id;
		if(addSelection[exerciceId]){
			delete addSelection[exerciceId];
		}else{
			$scope.configExercice(exercice);
			addSelection[exerciceId] = exercice;
		}
	};

	$scope.addExercices = function(){
		TrainingRepository.addExercicesToDay($scope.day, addSelection, function(error, result){
			console.log(result);
			if(!error){
				$scope.closeSelection();
				$scope.$apply(function(){
					$scope.day = result;
				});
			}
		});
	};

}]);
