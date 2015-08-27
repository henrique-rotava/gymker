angular.module('gymker.userservices', [])

.factory('UserRepository', ['DataBase', function(DataBase){

	function User(){
		this.type = 'user';
		this.name = 'Meu Nome';
		this.profilePic = 'img/default_profile_picture.jpg'
	};
	
	var save = function(doc, callback){

		doc.type = 'user';

		DataBase.db.post(
			doc
		).then(function(response){
			callback(false, response);
		}).catch(function(err){
			callback(true, err);
		});
	};

	var getAll = function(callback){

		DataBase.db.query("index/by_type", {
			key : "user",
			include_docs : true
		}).then(function (result) {
			callback(false, result.rows);
		}).catch(function (err) {
			callback(true, err);
		});

	};
	
	var get = function(uid, callback){
		DataBase.db.get(uid)
		.then(function (result) {
			callback(false, result);
		}).catch(function (err) {
			console.log('error', err);
			callback(true, err);
		});
	};
	
	var create = function(callback){
		DataBase.db.post(
			new User()
		).then(function(response){
			get(response.id, callback);
		}).catch(function(err){
			console.log('error creating user',err);
			callback(true, err);
		});
	};

	return {
		save: save,
		getAll: getAll,
		get: get,
		create: create
	};

}]);