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
	
	var saveAthletesRelationships = function (user, relateds, callback){
		
		var athletes = user.athletes || [];
		var related;
		var relationPromises = [];
		for(prop in relateds){
			var related = relateds[prop];
			var relation = {
				id: user.id + related.id,
				confirmed: false,
				person: user.id,
				related: related.id
			};
			
			if (user.athletes.indexOf(relation.id) < 0) {
				user.athletes.push(relation.id);
			}
			relationPromises.push(DataBase.rel.save('relationship', relation));
		}
		
		Promise.all(relationPromises)
		.then(function(result){
			return DataBase.rel.save('user', user);
		}).then(function (result) {
			var user = result.users[0];
			callback(false, user);
		}).catch(function(err){
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