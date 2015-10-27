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
	
}]);