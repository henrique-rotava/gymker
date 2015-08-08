var localDB = new PouchDB("gymkerr");
var remoteDB = new PouchDB("http://localhost:5984/gymkerr");

var app = angular.module('gymker', ['ionic', 'starter.controllers', 'gymker.exercicecontrollers'])

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

  .state('app.exercices-list', {
    url: "/exercices/list",
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/exercices/list');
});
