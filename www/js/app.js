var app = angular.module('gymker', 
		[
		 'ionic', 
		 'starter.controllers', 
		 'gymker.exercicecontrollers', 
		 'gymker.profilecontrollers',
		 'gymker.authenticationServices',
		 'gymker.trainingcontrollers',
		 'gymker.database'
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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.exercices-create', {
    url: "/exercices/create",
    views: {
      'menuContent': {
        templateUrl: "templates/exercices/create.html"
      }
    }
  })

  .state('app.exercices', {
    url: "/exercices",
    views: {
      'menuContent': {
        templateUrl: "templates/exercices/list.html"
      }
    }
  })

  .state('app.training-create', {
    url: "/training/create-start",
    views: {
      'menuContent': {
        templateUrl: "templates/training/create.html"
      }
    }
  })
  
  .state('app.profile', {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/profile/index.html"
      }
    }
  })
  
  .state('app.profile-edit', {
    url: "/profile/edit",
    views: {
      'menuContent': {
        templateUrl: "templates/profile/edit.html"
      }
    }
  })
  
  .state('app.athletes', {
    url: "/profile/coach/athletes",
    views: {
      'menuContent': {
        templateUrl: "templates/profile/athletes.html"
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/profile');
});