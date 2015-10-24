angular.module('profilecontrollers')

.controller('ProfileController', ['$rootScope', '$scope', 'ExecutionRepository',
                                  function($rootScope, $scope, ExecutionRepository){
	
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	function startUp(){
		
		function loadExecutions(){
			ExecutionRepository.getExecutionsByUser($rootScope.user, function(error, result){
				if(!error){
					$scope.$apply(function(){
						$scope.executions = result;
					});
				}
			});
		}
		
		if($rootScope.user){
			loadExecutions();
		}else{
			$rootScope.$watch('user', function(){
				loadExecutions();
			});
		}
	}
	
	$scope.getExecutionPercent = function(execution){
		return ((execution.doneExercicesCount || 0) * 100) / execution.trainingExercices.length;
	};
	
	$scope.getExecutionTime = function(execution){
		var startDate = execution.startDate || new Date();
		var endDate = execution.endDate || new Date();
		return getTimeDiff(startDate, endDate);
	};
	
}]);