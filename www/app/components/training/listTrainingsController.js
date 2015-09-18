angular.module('gymker.trainingcontrollers')

.controller('ListTrainingsController', 
		['$scope', '$rootScope', 'TrainingRepository', '$ionicLoading', 
		 function($scope, $rootScope, TrainingRepository, $ionicLoading){
	
	$scope.trainingsLoaded = false;
	$scope.myTrainingsLoaded = false;
	$scope.myTrainings = [];
			
	$scope.loadAthletes = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				TrainingRepository.getTrainings($rootScope.user.trainings, function(err, result){
					if(!err){
						$scope.trainings = result;
					}
					$ionicLoading.hide();
					$scope.trainingsLoaded = true;
				});
				TrainingRepository.getTrainings($rootScope.user.authorTrainings, function(err, result){
					if(!err){
						$scope.myTrainings = result;
					}
					$scope.myTrainingsLoaded = true;
				});
			}
		});
	}
	
	$scope.loadAthletes();
	
	
}])