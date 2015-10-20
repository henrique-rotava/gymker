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
	
}]);
			