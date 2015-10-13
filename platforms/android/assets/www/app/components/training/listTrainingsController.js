angular.module('gymker.trainingcontrollers')

.controller('ListTrainingsController', 
		['$scope', '$rootScope', 'TrainingRepository', '$ionicLoading', 
		 function($scope, $rootScope, TrainingRepository, $ionicLoading){
	
	$scope.trainingsLoaded = false;
	$scope.myTrainingsLoaded = false;
	$scope.myTrainings = [];
	
	function loadTrainings(){
		TrainingRepository.get($rootScope.user.trainings, function(err, result){
			if(!err){
				$scope.trainings = result;
			}
			$ionicLoading.hide();
			$scope.trainingsLoaded = true;
			$scope.$broadcast('scroll.refreshComplete');
		});
	}
	
	function loadMyTrainings(){
		TrainingRepository.get($rootScope.user.authorTrainings, function(err, result){
			if(!err){
				$scope.myTrainings = result;
			}
			$scope.myTrainingsLoaded = true;
			$scope.$broadcast('scroll.refreshComplete');
		});
	}
	
	$scope.loadTrainings = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				loadTrainings();
				loadMyTrainings();
			}
		});
	}
	
	$scope.loadTrainings();
	
	$scope.refreshTrainings = function(){
		loadTrainings();
	};
	
	$scope.refreshMyTrainings = function(){
		loadMyTrainings();
	};
}])