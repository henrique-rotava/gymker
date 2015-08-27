angular.module('gymker.trainingcontrollers', ['gymker.exerciceservices'])

.controller('TrainingController', 
			['$scope', 'ExerciceRepository', '$ionicPopup', '$ionicLoading',
			function($scope, ExerciceRepository, $ionicPopup, $ionicLoading){
	
	$scope.exercices = [];
    $scope.search = "";
	
    $ionicLoading.show({ 
        template: 'Carregando...'
    });

    var load = function(){
      ExerciceRepository.getAll(function(err, result){
        if(!err){
          $scope.exercices = result;
        }
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    load();
	
	$scope.configExercice = function(exercice){
		
		$scope.exercice = angular.copy(exercice.doc);
		
		$scope.exercice.series = $scope.exercice.series || 0;
		$scope.exercice.repetitions = $scope.exercice.repetitions || 0;
		$scope.exercice.weight = $scope.exercice.weight || 0;
		
		var exerciceOptionsPopup = $ionicPopup.show({
			templateUrl: 'templates/exercices/exercice-intensity-popup.html' ,
			title: 'Configure o exercício',
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
	        		   angular.copy($scope.exercice, exercice.doc);
	        	   }
	        	   
	           }
			]
		});
	}
	
	$scope.increase = function(prop){
		var actualValue = parseFloat($scope.exercice[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else {
			++actualValue;
		}
		$scope.exercice[prop] = actualValue;
	};
	
	$scope.decrease = function(prop){
		var actualValue = parseFloat($scope.exercice[prop]);
		if(!actualValue && actualValue != 0){
			actualValue = 0;
		} else if(actualValue - 1 > 0){
			--actualValue
		}
		$scope.exercice[prop] = actualValue;
	};

}]);
