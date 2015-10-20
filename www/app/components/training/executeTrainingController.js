angular.module('gymker.trainingcontrollers')

.controller('ExecuteTrainingController', 
			['$rootScope', '$scope', 'TrainingRepository', '$stateParams', '$ionicPopup', '$interval', '$ionicHistory', '$state',
			function($rootScope, $scope, TrainingRepository, $stateParams, $ionicPopup, $interval, $ionicHistory, $state){
	
	var startUp = function(){
		$scope.training = {};
		$scope.timer = {hours: '00', minutes: '00', seconds: '00'};
		loadData();
	}
	
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	var loadData = function(){
		TrainingRepository.get($stateParams.trainingId, function(error, result){
			if(!error){
				$scope.training = result;
				var day = $stateParams.day;
				if(day){
					for(index in $scope.training.days){
						if($scope.training.days[index].marker == day){
							$scope.day = $scope.training.days[index];
							TrainingRepository.createExecutionTrainingDay($scope.day, $scope.training, function(error, result){
								if(!error){
									$rootScope.executingDay = result;
								}
							});
						}
					}
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
			return Object.keys(muscles).join();
		}
	};
	
	$scope.checkExercice = function(trainingExercice){
		trainingExercice.done = !trainingExercice.done;
		$scope.configExercice(trainingExercice);
		
		if(!$rootScope.executingDay.doneExercicesCount){
			$rootScope.executingDay.doneExercicesCount = 0;
		}
		
		$rootScope.executingDay.doneExercicesCount += trainingExercice.done ? 1 : -1;
		
		$scope.completePercent = ($rootScope.executingDay.doneExercicesCount * 100) / $rootScope.executingDay.trainingExercices.length;
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
	
	$scope.startExecution = function(){
		$rootScope.executingDay.started = true;
		if(!$rootScope.executingDay.startDate){
			$rootScope.executingDay.startDate = new Date();
		}
		
		timerCounter = $interval(function(){
			$scope.timer = getTimeRemaining($rootScope.executingDay.startDate);
		}, 1000);
		
		$rootScope.executingDay.running = true;
	};
	
	$scope.stopExecution = function(){
		$rootScope.executingDay.endDate = new Date();
		$rootScope.executingDay.running = false;
		$interval.cancel(timerCounter);
	};
	
	$scope.discardExecution = function(){
		TrainingRepository.deleteExecutionTrainingDay($rootScope.executingDay, function(error, result){
			
			$interval.cancel(timerCounter);
			
			delete $rootScope.executingDay;
			
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.training-day', {trainingId: $scope.training.id, day: $scope.day.marker});
		});
		
	};
	
	function getTimeRemaining(startTime){
		
		function formatTime(decimal){
			return decimal < 10 ? '0' + decimal : decimal;
		};
		
		var t =  Date.parse(new Date()) - Date.parse(startTime);
		var seconds = Math.floor( (t/1000) % 60 );
		var minutes = Math.floor( (t/1000/60) % 60 );
		var hours = Math.floor( (t/(1000*60*60)) % 24 );
		return {
			'hours': formatTime(hours),
			'minutes': formatTime(minutes),
			'seconds': formatTime(seconds)
		};
	}
	
}]);
			