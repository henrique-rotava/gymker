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
	
});

app.filter('filterByProperties', function () {
    /* array is first argument, each additional argument is prefixed by a ":" in filter markup*/
    return function (dataArray, searchTerm, propertyNames) {
        if (!dataArray) return;
        if (!searchTerm) {
            return dataArray
        } else {
            var term = searchTerm.toLowerCase();
            return dataArray.filter(function (item) {
            	for(index in propertyNames){
            		var propertyName = propertyNames[index];
            		var property = Object.resolve(propertyName, item);
            		if(property && property.toLowerCase().indexOf(term) > -1){
                		return true;
                	}
            	}
            	return false;
            });
        }
    }
    
});

Object.resolve = function(path, obj, safe) {
	return path.split('.').reduce(function(prev, curr) {
		return !safe ? prev[curr] : (prev ? prev[curr] : undefined)
	}, obj || self)
}