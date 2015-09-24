angular.module('gymker.userservices', [])

.factory('UserRepository', ['DataBase', function(DataBase){

	function User(){
		this.name = 'Meu Nome';
		this.profilePic = 'img/default_profile_picture.jpg'
	};
	
	var save = function(doc, callback){
		DataBase.rel.save('user',
			doc
		).then(function(result){
			callback(false, result.users[0]);
		}).catch(function(err){
			callback(true, err);
		});
	};

	var getAll = function(callback){

		DataBase.rel.find("user")
		.then(function (result) {
			callback(false, result.users);
		}).catch(function (err) {
			callback(true, err);
		});

	};
	
	var get = function(uid, callback){
		DataBase.rel.find('user', 
			uid
		).then(function (result) {
			console.log(result);
			var user = DataBase.parseResponse('user', uid, angular.copy(result));
			callback(false, user);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var create = function(callback){
		DataBase.rel.save('user',
			new User()
		).then(function(result){
			callback(false, result.users[0]);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var getRelationsIDs = function (promisses, userAthletes){
		userAthletes = userAthletes || [];
		for(var index = 0; index < promisses.length; index++){
			var relations = promisses[index].relationships;
			for(var relIndex = 0; relIndex < relations.length; relIndex++){
				var relation = relations[relIndex];
				userAthletes.push(relation.id);
			}
		}
		return userAthletes;
	};
	
	var saveAthletesRelationships = function (user, relateds, callback){
		var relationPromises = [];
		var relateds = Object.keys(relateds);
		for(var index = 0; index < relateds.length; index++){
			var related = relateds[index];
			var relation = {
				confirmed: false,
				person: user.id,
				related: related
			};
			
			relationPromises.push(DataBase.rel.save('relationship', relation));
		}
		
		Promise.all(relationPromises)
		.then(function(result){
			user.athletes = getRelationsIDs(result, user.athletes);
			return DataBase.rel.save('user', user);
		}).then(function (result) {
			var user = result.users[0];
			callback(false, user);
		}).catch(function(err){
			console.log(err);
			callback(true, err);
		});
	};
	
	var getUserAthletes = function(user, callback){
		DataBase.rel.find('relationship',
			user.athletes
		).then(function (response) {
			var relations = DataBase.parseResponse('relationship', user.athletes, response);
			callback(false, relations);
		}).catch(function (err) {
			console.log(err);
			callback(true, err);
		});
	};

	return {
		save: save,
		getAll: getAll,
		get: get,
		create: create,
		saveAthletesRelationships: saveAthletesRelationships,
		getUserAthletes: getUserAthletes
	};

}]);