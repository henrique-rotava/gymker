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
			console.log(response.users[0]);
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
		
		var relations = user.athletes || [];
		for(prop in relateds){
			var related = relateds[prop];

			var relationship = {
				id: user.id + related.id,
				confirmed: false,
				person: user,
				related: related
			};
			relations.push(relationship);
			user.athletes = relations;
			
			console.log(user);
		}
		console.log('acabou');
//		DataBase.rel.save('user',
//			user
//		).then(function(response){
//			callback(false, response.users[0]);
//		}).catch(function(err){
//			callback(true, err);
//		});
		
	}

	return {
		save: save,
		getAll: getAll,
		get: get,
		create: create,
		saveAthletesRelationships: saveAthletesRelationships
	};

}]);