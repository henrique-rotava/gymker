angular.module('gymker.userservices', [])

.factory('UserRepository', [ function(){

	function User(){
		this.type = 'user';
		this.name = 'Meu Nome';
		this.profilePic = 'img/default_profile_picture.jpg'
	};
	
	var save = function(doc, callback){

		doc.type = 'user';

		localDB.post(
			doc
		).then(function(response){
			callback(false, response);
		}).catch(function(err){
			callback(true, err);
		});
	};

	var getAll = function(callback){

		localDB.query("index/by_type", {
			key : "user",
			include_docs : true
		}).then(function (result) {
			callback(false, result.rows);
		}).catch(function (err) {
			callback(true, err);
		});

	};
	
	var get = function(uid, callback){
		localDB.get(uid)
		.then(function (result) {
			callback(false, result);
		}).catch(function (err) {
			console.log('error', err);
			callback(true, err);
		});
	};
	
	var create = function(callback){
		localDB.post(
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