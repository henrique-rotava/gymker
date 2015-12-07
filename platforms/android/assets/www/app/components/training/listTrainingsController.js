angular.module('gymker.trainingcontrollers')

.controller('ListTrainingsController',
		['$scope', '$rootScope', '$state', 'TrainingRepository', '$ionicLoading', 'UserRepository',
		 function($scope, $rootScope, $state, TrainingRepository, $ionicLoading, UserRepository){

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

	// Removing trainings //
	$scope.removeSelection = function(){
		$ionicLoading.show({
	      template: 'Carregando...'
	  });

		var userTrainings = $rootScope.user.trainings;
		var resultTrainings = [];
		for(var index = 0; index < userTrainings.length; index++){
			var userTraining =  userTrainings[index];
			if(!selection[userTraining]){
				resultTrainings.push(userTraining);
			}
		}

		$rootScope.user.trainings = resultTrainings;

		UserRepository.save(angular.copy($rootScope.user), function(error, result){
			if(!error){
				$rootScope.user = result;
			}
			removeSelection = {};
			$scope.select = false;
			$ionicLoading.hide();
		});

	};
	var selection = {};
	$scope.clickAction = function(trainingId){
		if($scope.select){
			if(selection[trainingId]){
				delete selection[trainingId];
			}else{
				selection[trainingId] = true;
			}
		} else {
			$state.go('app.training-show', {trainingId: trainingId});
		}
	};

}])
