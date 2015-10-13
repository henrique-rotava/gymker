angular.module('gymker.trainingcontrollers')

.controller('ShowTrainingController', 
			['$rootScope', '$scope', 'TrainingRepository', '$stateParams', '$ionicPopup', '$interval',
			function($rootScope, $scope, TrainingRepository, $stateParams, $ionicPopup, $interval){
	
	$scope.training = {};
	$scope.doneExercicesCount = 0;
	$scope.completePercent = 0;
	$scope.timer = {hours: '00', minutes: '00', seconds: '00'};

				
	TrainingRepository.get($stateParams.trainingId, function(error, result){
		if(!error){
			$scope.training = result;
			var day = $stateParams.day;
			if(day){
				for(index in $scope.training.days){
					if($scope.training.days[index].marker == day){
						$scope.day = $scope.training.days[index];
					}
				}
			}
		}
	});
	
	$scope.getDayExercicesMuscles = function(day){
		console.log(day);
		var muscles = {};
		var trainingExercices = day.trainingExercices;
		for(var index = 0; index < trainingExercices.length; index++){
			var muscle = trainingExercices[index].exercice.muscle;
			muscles[muscle] = '';
		}
		return Object.keys(muscles).join();
	};
	
	$scope.checkExercice = function(trainingExercice){
		trainingExercice.done = !trainingExercice.done;
		$scope.configExercice(trainingExercice);
		$scope.doneExercicesCount += trainingExercice.done ? 1 : -1;
		
		$scope.completePercent = ($scope.doneExercicesCount * 100) / $scope.day.trainingExercices.length;
	};
	
	$scope.configExercice = function(exercice){
		
		var texercice = angular.copy(exercice);
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
	
	$scope.startTraining = function(training){
		if(!$scope.startDate){
			$scope.startDate = new Date();
		}
		
		timerCounter = $interval(function(){
			$scope.timer = getTimeRemaining($scope.startDate);
		}, 1000);
		
		$scope.training.running = true;
	};
	
	$scope.stopTraining = function(training){
		$scope.endDate = new Date();
		$scope.training.running = false;
		$interval.cancel(timerCounter);
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
			