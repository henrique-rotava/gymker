angular.module('exercicecontrollers')

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



