angular.module('gymker.exerciceservices', [])

.factory('ExerciceRepository', ['DataBase', function(DataBase){

	var save = function(doc, callback){
		DataBase.rel.save('exercice',
			doc
		).then(function(response){
			callback(false, response.exercices[0]);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	
	var getAll = function(callback){
		DataBase.rel.find("exercice")
		.then(function (result) {
			callback(false, result.exercices);
		}).catch(function (err) {
			callback(true, err);
		});
	};

	var get = function(id, callback){
		DataBase.rel.find('exercice', 
			id
		).then(function (result) {
			var user = DataBase.parseResponse('exercice', id, angular.copy(result));
			callback(false, user);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var saveVote = function(vote, callback){
		DataBase.rel.save('vote',
			vote
		).then(function(response){
			callback(false, response.votes[0]);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var getExerciceVotesCount = function(exerciceId, type, callback){
		
		var exerciceVoteQuery = {
			map: function (doc) {
				if(doc._id.indexOf('vote') == 0){
					emit(doc.data.exercice + doc.data.vote);
				}
			},
			reduce: '_count'
		};
		
		DataBase.query(exerciceVoteQuery, {
			key: exerciceId + type,
		}).then(function(result){
			console.log(result);
			var count = result.rows[0] ? result.rows[0].value : 0;
			callback(false, count);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var getUserExerciceVote = function(exerciceId, userId, callback){
		var exerciceVoteQuery = {
			map: function (doc) {
				if(doc._id.indexOf('vote') == 0){
					emit(doc.data.exercice + doc.data.user);
				}
			}
		};
		
		DataBase.query(exerciceVoteQuery, {
			key: exerciceId + userId,
			limit: 1,
			include_docs: true
		}).then(function(result){
			var vote;
			if(result.rows && result.rows[0]){
				vote = result.rows[0].doc.data.vote;
			}
			callback(false, vote);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var getMuscles = function(callback){
		DataBase.rel.find('config', 'muscles')
		.then(function(result){
			callback(false, result.configs[0]);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	
	var repository = {
		save: save,
		getAll: getAll,
		get: get,
		saveVote: saveVote,
		getExerciceVotesCount: getExerciceVotesCount,
		getUserExerciceVote: getUserExerciceVote,
		getMuscles: getMuscles
	}

	return repository;

}]);