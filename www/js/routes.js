app.config(function($stateProvider, $urlRouterProvider) {
  

	$stateProvider.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "templates/menu.html"
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
	
	.state('app.exercice', {
		url: "/exercice/:exerciceId",
		views: {
			'menuContent': {
				templateUrl: "templates/exercices/exercice.html"
			}
		}
	})

	.state('app.training-show', {
		url: "/training/show/:trainingId",
		views: {
			'menuContent': {
				templateUrl: "templates/training/training.html"
			}
		}
	})
	
	.state('app.training-day', {
		url: "/training/show/:trainingId/:day",
		views: {
			'menuContent': {
				templateUrl: "templates/training/training-day.html"
			}
		}
	})
	
	.state('app.execute-training-day', {
		url: "/training/execute/:executionId",
		views: {
			'menuContent': {
				templateUrl: "templates/training/execute-training-day.html"
			}
		}
	})

	
	.state('app.training-create', {
		url: "/training/create",
		views: {
			'menuContent': {
				templateUrl: "templates/training/create/create.html"
			}
		}
	})
  
	.state('app.training-list', {
		url: "/training/list",
		views: {
			'menuContent': {
				templateUrl: "templates/training/list/list-trainings.html"
			}
		}
	})
  
	.state('app.training-charts', {
		url: "/training/charts/:trainingId/:day",
		views: {
			'menuContent': {
				templateUrl: "templates/analytics/trainingCharts.html"
			}
		}
	})
	
	.state('app.profile', {
		url: "/profile",
		views: {
			'menuContent': {
				templateUrl: "templates/profile/profile.html"
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
		url: "/profile/athletes",
		views: {
			'menuContent': {
				templateUrl: "templates/profile/athletes.html"
			}
		}
	})
  
	.state('app.coachs', {
		url: "/profile/coachs",
		views: {
			'menuContent': {
				templateUrl: "templates/profile/coachs.html"
			}
		}
	})
  
	.state('app.notifications', {
		url: "/profile/notifications",
		views: {
			'menuContent': {
				templateUrl: "templates/profile/notifications.html"
			}
		}
	})
  
	.state('app.notifications-contactrequest', {
		url: "/profile/contact-request-notification/:notificationId",
		views: {
			'menuContent': {
				templateUrl: "templates/notifications/contact-request-notification.html"
			}
		}
	})
  
	.state('app.notifications-training', {
		url: "/profile/training-notification/:notificationId",
		views: {
		  'menuContent': {
			  templateUrl: "templates/notifications/training-notification.html"
		  }
		}
	})
	
  // if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/profile');
});