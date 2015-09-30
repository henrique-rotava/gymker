var app = angular.module('gymker', 
		[
		 'ionic', 
		 'starter.controllers', 
		 'exercicecontrollers', 
		 'profilecontrollers',
		 'gymker.authenticationServices',
		 'gymker.trainingcontrollers',
		 'gymker.database',
		 'notificationservices',
		 'notificationcontrollers'
		 ])

.run(function($ionicPlatform, DataBase, AuthService, $rootScope) {
	$ionicPlatform.ready(function() {
	  	if (window.cordova && window.cordova.plugins.Keyboard) {
    		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
    		StatusBar.styleDefault();
		}
	});

	DataBase.startUp();
	
	AuthService.getUser(function(error, result){
		if(!error){
			$rootScope.user = result;
		}
	});
	
})
