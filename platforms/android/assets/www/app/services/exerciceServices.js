angular.module('gymker.exerciceservices', [])

.factory('ExerciceRepository', ['DataBase', function(DataBase){

	this.save = function(doc, callback){

		doc.type = 'exercice';

		DataBase.post(
			doc
		).then(function(response){
			callback(false, response);
		}).catch(function(err){
			callback(true, err);
		});
	}

	this.getAll = function(callback){

		DataBase.query("index/by_type", {
			key : "exercice",
			include_docs : true
		}).then(function (result) {
			callback(false, result.rows);
		}).catch(function (err) {
			callback(true, err);
		});

	}

	return this;

}]);