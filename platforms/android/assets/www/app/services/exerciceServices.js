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
			console.log(result);
			callback(false, result.exercices);
		}).catch(function (err) {
			callback(true, err);
		});
		
	}
	
	var repository = {
		save: save,
		getAll: getAll
	}

	return repository;

}]);