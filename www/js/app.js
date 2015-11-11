var app = angular.module('gymker', 
		[
		 'ionic', 
		 'exercicecontrollers', 
		 'profilecontrollers',
		 'gymker.authenticationServices',
		 'gymker.trainingcontrollers',
		 'gymker.database',
		 'notificationservices',
		 'notificationcontrollers',
		 'analyticscontrollers'
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
	
	updateSessionUser = function(user){
		$rootScope.$apply(function(){
			$rootScope.user = user;
		});
	}

	DataBase.startUp();
	
	loadUser = function(){
		AuthService.getUser(function(error, result){
			if(!error){
				updateSessionUser(result);
			}
		});
	}
	
	loadUser();
	
	$rootScope.getExecutionPercent = function(execution){
		return ((execution.doneExercicesCount || 0) * 100) / execution.trainingExercices.length;
	};
	
	$rootScope.getExecutionTime = function(execution){
		var startDate = execution.startDate || new Date();
		var endDate = execution.endDate || new Date();
		return getTimeDiff(startDate, endDate);
	};
	
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

app.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

app.directive('youtubeEmbed', ['$sce', function($sce) {
	return function (scope, elem, attr){
		var video = attr.videoId;
		var src = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + video + '?autohide=1&showinfo=0');
		elem.html('<iframe width="560" height="315" src="' + src + '" frameborder="0" allowfullscreen></iframe>')
	};
}]);

/* Global functions */
Object.resolve = function(path, obj, safe) {
	return path.split('.').reduce(function(prev, curr) {
		return !safe ? prev[curr] : (prev ? prev[curr] : undefined)
	}, obj || self)
};

window.getTimeDiff = function(startTime, endDate){
	
	function formatTime(decimal){
		return decimal < 10 ? '0' + decimal : decimal;
	};
	
	var t =  Date.parse(endDate || new Date()) - Date.parse(startTime);
	var seconds = formatTime(Math.floor( (t/1000) % 60 ) || 0);
	var minutes = formatTime(Math.floor( (t/1000/60) % 60 ) || 0);
	var hours = formatTime(Math.floor( (t/(1000*60*60)) % 24 ) || 0);
	
	return {
		'hours': hours,
		'minutes': minutes,
		'seconds': seconds,
		'time': hours + ':' + minutes + ':' + seconds
	};
}