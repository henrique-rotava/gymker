angular.module('gymker.trainingcontrollers')

.controller('ExecuteTrainingController', 
			['$scope', 'ExecutionRepository', '$stateParams', '$ionicPopup', '$interval', '$ionicHistory', '$state',
			function($scope, ExecutionRepository, $stateParams, $ionicPopup, $interval, $ionicHistory, $state){
	
	
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	var startUp = function(){
		$scope.training = {};
		$scope.timer = {hours: '00', minutes: '00', seconds: '00'};
		$scope.executingDay = {};
		$scope.now = new Date();
		loadData();
	}
	
	var loadData = function(){
		ExecutionRepository.get($stateParams.executionId, function(error, result){
			if(!error){
				$scope.$apply(function(){
					$scope.executingDay = result;
					startCounter($scope.executingDay);
					$scope.completePercent = (($scope.executingDay.doneExercicesCount || 0) * 100) / $scope.executingDay.trainingExercices.length;
				});
			}
		});
	}
	
	$scope.getDayExercicesMuscles = function(day){
		if(day && day.trainingExercices){
			var muscles = {};
			var trainingExercices = day.trainingExercices;
			for(var index = 0; index < trainingExercices.length; index++){
				var muscle = trainingExercices[index].exercice.muscle;
				muscles[muscle] = '';
			}
			return Object.keys(muscles).join();
		}
	};
	
	$scope.checkExercice = function(trainingExercice){
		if(!$scope.executingDay.finished){
			trainingExercice.done = !trainingExercice.done;
			$scope.configExercice(trainingExercice);
			
			if(!$scope.executingDay.doneExercicesCount){
				$scope.executingDay.doneExercicesCount = 0;
			}
			
			$scope.executingDay.doneExercicesCount += trainingExercice.done ? 1 : -1;
			
			$scope.completePercent = ($scope.executingDay.doneExercicesCount * 100) / $scope.executingDay.trainingExercices.length;
			
		}
	};
	
	$scope.configExercice = function(exercice){
		
		var texercice = angular.copy(exercice);
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
	        	   type: 'button-balanced button-clear',
	        	   onTap: function(e){
	        		   ExecutionRepository.save($scope.executingDay, function(error, result){
	        				if(!error){
	        					$scope.executingDay = result;
	        				}
	        			});
	        	   }
	           },
	           { 
	        	   text: 'Salvar',
	        	   type: 'button-balanced button-clear',
	        	   onTap: function(e){
	        		   
	        		   exercice.intensity = $scope.exercice.intensity;
	        		   
	        		   ExecutionRepository.save($scope.executingDay, function(error, result){
	        				if(!error){
	        					$scope.executingDay = result;
	        				}
	        			});
	        		   
	        		   // Save training exercice for another executions
	        		   ExecutionRepository.saveTrainingExercice(exercice, function(error, result){
	        			  console.log(result); 
	        		   });
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
	
	$scope.startExecution = function(execution){
		
		execution.started = true;
		
		if(!execution.startDate){
			execution.startDate = new Date();
		}
		
		startCounter(execution);
		
		execution.running = true;
		execution.finished = false;
		
		ExecutionRepository.save(execution, function(error, result){
			if(!error){
				$scope.executingDay = result;
			}
		});
	};
	
	var startCounter = function(execution){
		$scope.timer = getTimeDiff(execution.startDate, execution.endDate);
		if(execution.started){
			timerCounter = $interval(function(){
				$scope.timer = getTimeDiff(execution.startDate, execution.endDate);
			}, 1000);
		}
	}
	
	$scope.stopExecution = function(execution){
		execution.endDate = new Date();
		execution.running = false;
		execution.finished = true;
		$interval.cancel(timerCounter);
		ExecutionRepository.save(execution, function(error, result){
			if(!error){
				$scope.executingDay = result;
			}
		});
	};
	
	$scope.discardExecution = function(execution){
		
		console.log(execution);
		ExecutionRepository.del(angular.copy(execution), function(error, result){
			$interval.cancel(timerCounter);
			
			var trainingId = execution.training.id;
			var trainingDayMarker = execution.marker;
			delete $scope.executingDay;
			
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.training-day', {trainingId: trainingId, day: trainingDayMarker});
		});
	};
	
	$scope.saveExecution = function(execution){
		execution.endDate = new Date();
		execution.running = false;
		execution.finished = true;
		$interval.cancel(timerCounter);
		ExecutionRepository.save(execution, function(error, result){
			if(!error){
				$scope.executingDay = result;
				
				console.log('saving', execution);
				
				var trainingId = $scope.executingDay.training.id;
				var trainingDayMarker = $scope.executingDay.marker;
				
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.training-day', {trainingId: trainingId, day: trainingDayMarker});
			}
		});

	};
	
	
}]);
			