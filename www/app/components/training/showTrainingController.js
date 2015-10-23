angular.module('gymker.trainingcontrollers')

.controller('ShowTrainingController', 
			['$rootScope', '$scope', 'TrainingRepository','ExecutionRepository', '$stateParams', '$ionicHistory', '$state',
			function($rootScope, $scope, TrainingRepository, ExecutionRepository, $stateParams, $ionicHistory, $state){
	
				
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	$scope.training = {};
	
	var startUp = function(){
		TrainingRepository.get($stateParams.trainingId, function(error, result){
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
							});
						}
					}
				}
				
				
				// TODO remove
				ExecutionRepository.getExecutionsByTraining($scope.training, function(error, result){
					if(!error){
						$scope.$apply(function(){
							$scope.executions = result;
						});
					}
				});
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
	
}]);
			