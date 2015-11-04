angular.module('exercicecontrollers')

.controller('ExerciceController', ['$scope', '$stateParams', 'ExerciceRepository',
                                   function($scope, $stateParams, ExerciceRepository){
	
	
	$scope.$on('$ionicView.enter', function() {
		startUp();
	});
	
	var startUp = function(){
		$scope.upColor = 'dark';
		$scope.downColor = 'dark';
		$scope.canVote = false;
		var exerciceId = $stateParams.exerciceId;
		ExerciceRepository.get(exerciceId, function(error, result){
			console.log(result);
			if(!error){
				
				
				ExerciceRepository.getExerciceVotesCount(exerciceId, '1', function(error, result){
					$scope.upvotes = result;
				});
				
				ExerciceRepository.getExerciceVotesCount(exerciceId, '-1', function(error, result){
					$scope.downvotes = result;
				});
				
				ExerciceRepository.getUserExerciceVote(exerciceId, $scope.user.id, function(error, result){
					if(result === 1){
						$scope.upColor = 'balanced';
					}else if(result == -1){
						$scope.downColor = 'assertive';
					}else if(result === undefined){
						$scope.canVote = true;
					}
				});
				
				$scope.$apply(function(){
					$scope.exercice = result;
				});
			}
		});
	}
	
	$scope.upvote = function(exercice){
		if($scope.canVote){
			$scope.canVote = false;
			$scope.upvotes = $scope.upvotes ? $scope.upvotes++ : 1;
			$scope.upColor = 'balanced';
			var vote = {
				exercice: exercice.id,
				user: $scope.user.id,
				vote: 1
			};
			ExerciceRepository.saveVote(vote, function(error, result){
				console.log(result);
			});
		}
	};
	
	$scope.downvote = function(exercice){
		if($scope.canVote){
			$scope.canVote = false;
			$scope.downvotes = $scope.downvotes ? $scope.downvotes++ : 1;
			$scope.downColor = 'assertive';
			var vote = {
				exercice: exercice.id,
				user: $scope.user.id,
				vote: -1
			}
			ExerciceRepository.saveVote(vote, function(error, result){
				console.log(result);
			});
		}
	};
	
}])