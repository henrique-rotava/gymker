angular.module('profilecontrollers')

.controller('CoachController', ['$rootScope', '$scope', '$ionicModal', 'UserRepository', '$ionicLoading',
                                function($rootScope, $scope, $ionicModal, UserRepository, $ionicLoading){

	$scope.relatedUsersIDs = {};
	$scope.athletesLoaded = false;
	$scope.relations = [];
	
	function setRelatedIDs(){
		$scope.relatedUsersIDs = {};
		$scope.relatedUsersIDs[$rootScope.user.id] = true;
		for(var index = 0; index < $scope.relations.length; index++){
			var relation = $scope.relations[index];
			$scope.relatedUsersIDs[relation.related.id] = true;
		}
	}
	
	$scope.loadAthletes = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				UserRepository.getUserAthletes($rootScope.user, function(err, result){
					if(!err){
						$scope.relations = result;
						setRelatedIDs();
						$scope.athletesLoaded = true;
					}
					$ionicLoading.hide();
				});
			}
		});
	}
	
	$scope.loadAthletes();
	
	var athletesToAdd = {};
	
	$ionicModal.fromTemplateUrl('templates/profile/list-profiles.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.openInvite = function() {
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		UserRepository.getAll(function(err, result){
			if(!err){
				$scope.users = result;
			}
			$ionicLoading.hide();
		});
		$scope.modal.show();
	};
	
	$scope.closeInvite = function() {
		$scope.modal.hide();
	};
	
	var addAthlete = function(user){
		athletesToAdd[user.id] = user;
	};
	
	var removeAthlete = function(user){
		delete athletesToAdd[user.id];
	}
	
	$scope.selectUser = function(user){
		if(user.selected){
			var userSelected = angular.copy(user);
			delete userSelected.selected;
			addAthlete(userSelected);
		}else{
			removeAthlete(user);
		}
	};
	
	$scope.sendInvites = function(){
		UserRepository.saveAthletesRelationships($rootScope.user, athletesToAdd, function(error, result){
			if(!error){
				$rootScope.user = result;
				$scope.loadAthletes();
			}
			$scope.closeInvite();
			athletesToAdd = {};
		});
	};
	
}]);