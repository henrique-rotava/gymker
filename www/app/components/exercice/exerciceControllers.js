angular.module('exercicecontrollers')

.controller('CreateExerciceController', 
    ['$scope', '$ionicLoading', 'ExerciceRepository',
     function($scope, $ionicLoading, ExerciceRepository){

	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
    
	var startUp = function(){
		$scope.exercice = {};
		
		ExerciceRepository.getMuscles(function(error, result){
			console.log(result);
			if(!error){
				$scope.$apply(function(){
					$scope.muscles = result.muscles.sort();
				});
			}
		});
	};
	$scope.exerciceTypes = ['Tempo', 'Repetições'];

	$scope.createExercice = function(){
		ExerciceRepository.save($scope.exercice, function(error, result){
			if(!error){
				$ionicLoading.show({ 
					template: 'Exercício criado!',
					noBackdrop: true,
					duration: 2000
				});
				$scope.exercice = {};
			}else{
				$ionicLoading.show({ 
					template: 'Ocorreu um erro durante a criação do exercício.',
					noBackdrop: true,
					duration: 2000
				});
			}
		});
	};

}])

.controller('ListExerciceController', 
    ['$scope', '$ionicLoading', 'ExerciceRepository',
     function($scope, $ionicLoading, ExerciceRepository){

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

    $scope.refresh = function(){
      load();
    }

}])



