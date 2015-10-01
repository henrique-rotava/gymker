angular.module('profilecontrollers')

.controller('AthleteController', ['$rootScope', '$scope', '$ionicModal', 'UserRepository', '$ionicLoading', 'NotificationRepository',
                                function($rootScope, $scope, $ionicModal, UserRepository, $ionicLoading, NotificationRepository){

	$scope.$on('$ionicView.enter', function() {
		$scope.loadRelations();
	});
	
	var relationPropName = 'relater';
	$scope.relationUsersIDs = {};
	$scope.relationsLoaded = false;
	$scope.relations = [];
	
	function setRelationIDs(){
		$scope.relationUsersIDs = {};
		$scope.relationUsersIDs[$rootScope.user.id] = true;
		for(var index = 0; index < $scope.relations.length; index++){
			var relation = $scope.relations[index];
			$scope.relationUsersIDs[relation[relationPropName].id] = true;
		}
	}
	
	$scope.loadRelations = function(){
		$ionicLoading.show({
	        template: 'Carregando...'
	    });
		$rootScope.$watch('user', function(){
			if($rootScope.user){
				UserRepository.getUserRelations($rootScope.user, 'coachs', function(err, result){
					console.log(result);
					if(!err){
						$scope.relations = result;
						setRelationIDs();
						$scope.relationsLoaded = true;
					}
					$ionicLoading.hide();
				});
			}
		});
	}
	
	$scope.loadRelations();
	
	var usersToAdd = {};
	
	$ionicModal.fromTemplateUrl('templates/profile/list-profiles-to-add.html', {
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
	
	var addUser = function(user){
		usersToAdd[user.id] = user;
	};
	
	var removeUser = function(user){
		delete usersToAdd[user.id];
	}
	
	$scope.selectUser = function(user){
		if(user.selected){
			var userSelected = angular.copy(user);
			delete userSelected.selected;
			addUser(userSelected);
		}else{
			removeUser(user);
		}
	};
	
	$scope.sendInvites = function(){
		UserRepository.saveCoachsRelationships($rootScope.user, usersToAdd, function(error, result){
			if(!error){
				$rootScope.user = result.user;
				
				for(var index = 0; index < result.relations.length; index++){
					
					var coachId = result.relations[index].relater;
					var relationId = result.relations[index].id;
					
					var notification = {
						title: 'Solicitação de contato - Aluno',
						link: '#/app/profile/contact-request-notification/',
						message: 'Olá, você poderia me adicionar à sua lista de alunos?',
						createdDate: new Date(),
						relation: relationId,
						notificationType: 'relation'
					};
					
					NotificationRepository.save($rootScope.user.id, coachId, notification, function(error, result){
						if(!error){
							$rootScope.user = result;
						}
					});
				}
				
				$scope.loadRelations();
			}
			$scope.closeInvite();
			usersToAdd = {};
		});
	};
	
}]);