// modules
angular.module('profilecontrollers', 
		[]
);
angular.module('exercicecontrollers', 
		['gymker.exerciceservices']
);
angular.module('gymker.trainingcontrollers', 
		['gymker.exerciceservices', 'gymker.trainingservices', 'gymker.executionservices']
);
angular.module('notificationcontrollers', 
		[]
);