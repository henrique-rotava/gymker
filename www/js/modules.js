// modules
angular.module('profilecontrollers', 
		[]
);
angular.module('exercicecontrollers', 
		['gymker.exerciceservices']
).config(function($sceProvider) {
	$sceProvider.enabled(false);
});

angular.module('gymker.trainingcontrollers', 
		['gymker.exerciceservices', 'gymker.trainingservices', 'gymker.executionservices']
);
angular.module('notificationcontrollers', 
		[]
);
angular.module('analyticscontrollers', 
		['chart.js']
);