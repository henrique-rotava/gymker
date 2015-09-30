angular.module('gymker.userservices', [])

.factory('UserRepository', ['DataBase', function(DataBase){

	function User(){
		this.name = 'Meu Nome';
		this.profilePic = 'img/default_profile_picture.jpg'
	};
	
	var save = function(doc, callback){
		var uid;
		DataBase.rel.save('user',
			doc
		).then(function(result){
			uid = result.users[0].id;
			return DataBase.rel.find('user',  uid);
		}).then(function (result) {
			var user = DataBase.parseResponse('user', uid, angular.copy(result));
			callback(false, user);
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
	
	var getRelationsFromPromisses = function (promisses){
		var relationsArray = [];
		for(var index = 0; index < promisses.length; index++){
			var relations = promisses[index].relationships;
			for(var relIndex = 0; relIndex < relations.length; relIndex++){
				var relation = relations[relIndex];
				relationsArray.push(relation);
			}
		}
		return relationsArray;
	};
	
	var addAthletesToCoach = function(user, relations){
		user.athletes = user.athletes || [];
		for(var index = 0; index < relations.length; index++){
			user.athletes.push(relations[index]);
		}
	};
	
	var addCoachToAthlete = function(related, relations){
		related.coachs = related.coachs || [];
		for(var index = 0; index < relations.length; index++){
			var relation = relations[index];
			if(relation.related == related.id){
				related.coachs.push(relation);
			}
		}
	};
	
	var addCoachsToAthlete = function(athelte, relations){
		athelte.coachs = athelte.coachs || [];
		for(var index = 0; index < relations.length; index++){
			athelte.coachs.push(relations[index]);
		}
	};
	
	var addAthleteToCoach = function(coach, relations){
		coach.athletes = coach.athletes || [];
		for(var index = 0; index < relations.length; index++){
			var relation = relations[index];
			if(relation.relater == coach.id){
				coach.athletes.push(relation);
			}
		}
	};
	
	// The athlete requests to have a coach
	var saveCoachsRelationships = function (athlete, coachs, callback){
		var relations = [];
		var relationPromises = [];
		var coachsIds = Object.keys(coachs);
		for(var index = 0; index < coachsIds.length; index++){
			var coachId = coachsIds[index];
			var relation = {
				relaterConfirmed: false,	
				relatedConfirmed: true,
				relater: coachId,
				related: athlete.id,
				createdDate: new Date()
			};
			
			relationPromises.push(DataBase.rel.save('relationship', relation));
		}
		
		Promise.all(relationPromises)
		.then(function(result){
			relations = getRelationsFromPromisses(result);
			
			// add coach to athletes
			var coachsPromisses = [];
			for(var index = 0; index < coachsIds.length; index++){
				var coachId = coachsIds[index];
				var coach = coachs[coachId];
				addAthleteToCoach(coach, relations);
				coachsPromisses.push(DataBase.rel.save('user', coach));
			}
			return Promise.all(coachsPromisses);
		}).then(function (result) {
			addCoachsToAthlete(athlete, relations);
			return DataBase.rel.save('user', athlete);
		}).then(function (result) {
			return DataBase.rel.find('user', athlete.id);
		}).then(function (result) {
			var userResult = DataBase.parseResponse('user', athlete.id, result);
			callback(false, {user: userResult, relations: relations});
		}).catch(function(err){
			console.log(err);
			callback(true, err);
		});
	};
	
	// The coach requests to have an athlete
	var saveAthletesRelationships = function (user, relateds, callback){
		var relations = [];
		var relationPromises = [];
		var relatedsIds = Object.keys(relateds);
		for(var index = 0; index < relatedsIds.length; index++){
			var relatedId = relatedsIds[index];
			var relation = {
				relaterConfirmed: true,	
				relatedConfirmed: false,
				relater: user.id,
				related: relatedId,
				createdDate: new Date()
			};
			
			relationPromises.push(DataBase.rel.save('relationship', relation));
		}
		
		Promise.all(relationPromises)
		.then(function(result){
			relations = getRelationsFromPromisses(result);
			
			// add coach to athletes
			var relatedsPromisses = [];
			for(var index = 0; index < relatedsIds.length; index++){
				var relatedId = relatedsIds[index];
				var related = relateds[relatedId];
				addCoachToAthlete(related, relations);
				relatedsPromisses.push(DataBase.rel.save('user', related));
			}
			return Promise.all(relatedsPromisses);
		}).then(function (result) {
			addAthletesToCoach(user, relations);
			return DataBase.rel.save('user', user);
		}).then(function (result) {
			return DataBase.rel.find('user', user.id);
		}).then(function (result) {
			var userResult = DataBase.parseResponse('user', user.id, result);
			callback(false, {user: userResult, relations: relations});
		}).catch(function(err){
			console.log(err);
			callback(true, err);
		});
	};
	
	var getUserRelations = function(user, relationPropName, callback){
		DataBase.rel.find('relationship',
			user[relationPropName]
		).then(function (response) {
			var relations = DataBase.parseResponse('relationship', user[relationPropName], response);
			callback(false, relations);
		}).catch(function (err) {
			console.log(err);
			callback(true, err);
		});
	};
	
	var acceptRelationship = function(relationId, callback){
		DataBase.rel.find('relationship',
			relationId
		).then(function (result) {
			var relation = DataBase.parseResponse('relationship', relationId, result);
			relation.relatedConfirmed = true;
			relation.relaterConfirmed = true;
			return DataBase.rel.save('relationship', relation);
		}).then(function (result) {
			callback(false, result);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var rejectRelationship = function(relationId, callback){
		DataBase.rel.find('relationship',
			relationId
		).then(function (result) {
			var relation = DataBase.parseResponse('relationship', relationId, result);
			return DataBase.rel.del('relationship', relation);
		}).then(function (result) {
			callback(false, result);
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
		saveCoachsRelationships: saveCoachsRelationships,
		getUserRelations: getUserRelations,
		acceptRelationship: acceptRelationship,
		rejectRelationship: rejectRelationship
	};

}]);