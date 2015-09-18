angular.module('exercicecontrollers')

.controller('CreateExerciceController', 
    ['$scope', '$ionicLoading', 'ExerciceRepository',
     function($scope, $ionicLoading, ExerciceRepository){

  $scope.muscles = ['Bíceps', 'Tríceps', 'Peitoral', 'Costas', 'Antebraço', 'Coxa'];
  $scope.exerciceTypes = ['Tempo', 'Repetições'];

  $scope.exercice = {};

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
        console.log("error");
      }
      console.log(result);
    });
  }

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

.controller('UserExerciceController', function($scope, $ionicActionSheet, $ionicPopup) {
  
  

  $scope.exercices = [
    {name: "Bíceps com barra", muscle: "Bíceps", series: 4, repetitions: 10, weight: 15},
    {name: "Supinado", muscle: "Tríceps", series: 4, repetitions: 10, weight: 10},
    {name: "Esteira", muscle: "Aeróbico", tempo: 10, weight: 10},
    {name: "Barra", muscle: "Antebraço", series: 4, repetitions: 10, weight: 9}
  ]

  $scope.showActions = function(iindex) {
   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<i class="icon ion-ios-analytics-outline"></i>Desempenho' },
       { text: '<i class="icon ion-ios-star-outline"></i>Avaliação' },
       { text: '<i class="icon ion-ios-information-outline"></i>Detalhes'}
     ],
     destructiveText: '<i class="icon ion-ios-minus-outline"></i>Remover',
     titleText: 'Opções',
     cancelText: '<i class="icon ion-ios-close-outline"></i>Fechar',
     cancel: function() {
      },
     buttonClicked: function(index) {
       return true;
     },
     destructiveButtonClicked: function(){
        console.log(iindex);
        return true;
     }
   });

 };

	$scope.changeWeight = function(exer){
		$scope.weight = exer.weight;
		var weightPopUp = $ionicPopup.show({
			templateUrl: 'popup.html',
			title: 'Selecione o peso',
			scope: $scope,
			buttons: [
		          { text: 'Cancelar' },
		          {
		        	  text: '<b>Salvar</b>',
		        	  type: 'button-positive',
		        	  onTap: function(e) {
		        		  return $scope.weight;
		        	  }
		          }
		    ]
		});
	
		weightPopUp.then(function(res) {
			exer.weight = res;
		});
	}

})


