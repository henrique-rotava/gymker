angular.module('analyticscontrollers')

.controller('TrainingChartsController', ['$scope', '$stateParams', '$ionicLoading', 'ExecutionRepository', '$filter',
                                         function($scope, $stateParams, $ionicLoading, ExecutionRepository,  $filter){

	$scope.$on('$ionicView.enter', function() {
		startUp();
	});

	var startUp = function(){

    $ionicLoading.show({
          template: 'Carregando...'
    });

		$scope.title = 'Análise de treino';
		ExecutionRepository.getExecutionsByTrainingDay($stateParams.trainingId, $stateParams.day, function(error, result){
			if(!error){

				result = $filter('orderBy')(result, 'startDate');
				console.log(result);

				$scope.title = result[0].training.name + ' - ' + result[0].marker;
				$scope.execution = result[0];

				var exercices = {};
				var index = 0
				for (; index < result.length; index++){
					var execution = result[index];
					var trainingExercices = execution.trainingExercices;
					var startDate = $filter('date')(execution.startDate, 'dd/MM/yy');

					var indexExe = 0
					for (; indexExe < trainingExercices.length; indexExe++){
						var exercice = trainingExercices[indexExe];

						if(!exercices[exercice.id]){
							exercices[exercice.id] = {weights:[[]],labels: []};
							exercices[exercice.id].name = exercice.exercice.name;
						}
						exercices[exercice.id].weights[0].push(exercice.intensity.weight || 0);
						exercices[exercice.id].labels.push(startDate || "");
					}
				}
				$scope.$apply(function(){
					$scope.exercices = exercices;
          $ionicLoading.hide();
				});
			}
		});
	}

    $scope.colours = [{
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeColor: 'rgba(47, 132, 71, 0.8)',
        highlightFill: 'rgba(0, 0, 0, 0.8)',
        highlightStroke: 'rgba(0, 0, 0, 0.8)'
    }];

}])
