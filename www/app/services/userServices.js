angular.module('gymker.userservices', [])

.factory('UserRepository', ['DataBase', function(DataBase){

	function User(){
		this.name = 'Meu Nome';
		this.profilePic = 'img/default_profile_picture.jpg'
	};
	
	var save = function(doc, callback){
		DataBase.rel.save('user',
			doc
		).then(function(response){
			callback(false, response.users[0]);
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
		).then(function (response) {
			callback(false, response.users[0]);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var create = function(callback){
		DataBase.rel.save('user',
			new User()
		).then(function(response){
			callback(false, response.users[0]);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var saveAthletesRelationships = function (user, relateds, callback){
		
		var athletes = user.athletes || [];
		var related;
		for(prop in relateds){
			var related = relateds[prop];
			var relation = {
				id: user.id + related.id,
				confirmed: false,
				person: user.id,
				related: related.id
			};
			DataBase.rel.save('relationship', relation);
			if (athletes.indexOf(relation.id) == -1) {
				athletes.push(relation.id);
			}
		}
		
		user.athletes = athletes;
		
		DataBase.rel.save('user', 
			user
		).then(function (result) {
			callback(false, result);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var normalizeAthletesRelations = function(response){
		var relations = [];
		var relationships = response.relationships;
		var users = response.users;
		if(users.length == relationships.length){
			// easy way
			for(index in relationships){
				var relation = relationships[index];
				relation.related = users[index];
				relations.push(relation);
			}
		} else {
			// build objects
			// hard way
			var relatedUsers = {};
			for(index in users){
				var user = users[index];
				relatedUsers[user.id] = user;
			}
			for(index in relationships){
				var relation = relationships[index];
				var related = relatedUsers[relation.related];
				if(related){
					relation.related = related;
					relations.push(relation);
				}
			}
		}
		return relations;
	};
	
	var getUserAthletes = function(user, callback){
		DataBase.rel.find('relationship', 
			user.athletes
		).then(function (response) {
			callback(false, normalizeAthletesRelations(response));
		}).catch(function (err) {
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