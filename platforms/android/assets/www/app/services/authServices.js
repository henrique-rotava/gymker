angular.module('gymker.authenticationServices', ['gymker.userservices'])

.service('AuthService', ['UserRepository', function(UserRepository){
	
	var user;
	
	var getUserIDFromStorage = function(){
		return window.localStorage.getItem('uid');
	};
	
	var isAuthenticated = function(){
		return user || getUserIDFromStorage();
	};
	
	var populateSession = function(user){
		user = user;
		window.localStorage.setItem('uid', user._id);
	};
	
	var destroySession = function(user){
		user = undefined;
		window.localStorage.removeItem('uid');
	};
	
	var getUser = function(callback){
		if(!user){
			console.log('user not found');
			var uid = getUserIDFromStorage();
			if(uid){
				console.log('user id found in localStorage');
				UserRepository.get(uid, function(error, result){
					if(!error){
						console.log('user found in database');
						populateSession(result);
					}
					callback(error, result);
				});
			}else{
				console.log('user id not found in localStorage');
				UserRepository.create(function(error, result){
					if(!error){
						console.log('user created in database');
						populateSession(result);
					}
					callback(error, result);
				});
				console.log('user id not found in localStorage');
			}
			
		}else{
			console.log('user found');
			callback(false, user);
		}
	}
	
	return {
		getUser: getUser,
		isAuthenticated: isAuthenticated
	};
	
	
}])