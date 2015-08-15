var localDB = new PouchDB("gymkerr");
var remoteDB = new PouchDB("http://localhost:5984/gymkerr");

var app = angular.module('gymker', ['ionic', 'starter.controllers', 'gymker.exercicecontrollers', 'gymker.profilecontrollers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  localDB.sync(remoteDB, {live: true, retry: true});

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
    url: "/training/create",
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/profile');
});

localDB.get('_design/index').catch(function(error){
	if(error.status == '404'){
		
		var ddoc = {
		  _id: "_design/index",
		  views: {
		    by_type: {
		      map: function (doc) { 
		      	emit(doc.type); 
		      }.toString()
		    }
		  }
		};
		
		localDB.put(ddoc).then(function () {
		  console.log("index saved");
		}).catch(function (err) {
		  console.log("error saving the index", err);
		});
	
	}
});