angular.module('profilecontrollers')

.controller('CoachController', ['$rootScope', '$scope', '$ionicModal', 'UserRepository', '$ionicLoading',
                                function($rootScope, $scope, $ionicModal, UserRepository, $ionicLoading){

	$scope.athletesLoaded = false;
	$scope.loadAthletes = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				UserRepository.getUserAthletes($rootScope.user, function(err, result){
					if(!err){
						$scope.relations = result;
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
			$rootScope.user = result;
			$scope.closeInvite();
			$scope.loadAthletes();
		});
	};
	
}]);