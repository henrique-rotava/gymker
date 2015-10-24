angular.module('gymker.executionservices', [])

.factory('ExecutionRepository', ['DataBase', function(DataBase){
	
	var createExecutionTrainingDay = function(trainingDay, training, athlete, callback){
		var execution = angular.copy(trainingDay);

		delete execution.id;
		delete execution.rev;
		execution.training = training;
		execution.athlete = athlete;
		
		var executionID;
		DataBase.rel.save('execution', execution)
		.then(function(result){
			executionID = result.executions[0].id;
			return DataBase.rel.find('execution',  executionID);
		}).then(function(result){
			var executionDB = DataBase.parseResponse('execution', executionID, result);
			callback(false, executionDB);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var getExecutionTrainingDay = function(executionID, callback){
		DataBase.rel.find('execution',  executionID)
		.then(function(result){
			var executionDB = DataBase.parseResponse('execution', executionID, result);
			callback(false, executionDB);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var saveExecutionTrainingDay = function(execution, callback){
		DataBase.rel.find('execution',  executionID)
		.then(function(result){
			var executionDB = DataBase.parseResponse('execution', executionID, result);
			callback(false, executionDB);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var saveExecutionTrainingDay = function(execution, callback){
		var executionId;
		DataBase.rel.save('execution',
			execution
		).then(function(result){
			executionId = result.executions[0].id;
			return DataBase.rel.find('execution',  executionId);
		}).then(function (result) {
			var executiondb = DataBase.parseResponse('execution', executionId, result);
			callback(false, executiondb);
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var deleteExecutionTrainingDay = function(execution, callback){
		DataBase.rel.del('execution', execution)
		.then(function(result){
			callback(false, result);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	/* Training exercice */
	var saveTrainingExercice = function(trainingExercice, callback){
		trainingExercice = angular.copy(trainingExercice);
		delete trainingExercice.done;
		
		DataBase.rel.find('trainingExercice', trainingExercice.id)
		.then(function(result){
			var exerciceDB = DataBase.parseResponse('trainingExercice', trainingExercice.id, result);
			exerciceDB.intensity = trainingExercice.intensity;
			return DataBase.rel.save('trainingExercice', exerciceDB);
		}).then(function(result){
			var trainingExercicedb = result.trainingExercices[0];
			callback(false, trainingExercicedb);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	function getExecutionIds(result){
		var ids = [];
		var executions = result.rows;
		for(var index = 0; index < executions.length; index++){
			var id = executions[index].id.split('_')[2];
			ids.push(id);
		}
		return ids;
	};
	
	var getExecutionsByUser = function(user, callback){
		var executionIds;
		
		DataBase.query(function (doc) { 
			if(doc._id.indexOf('execution') == 0){
				emit(doc.data.athlete);
			}
		},
		{
			key: user.id,
			limit: 30
		}).then(function(result){
			executionIds = getExecutionIds(result);
			return DataBase.rel.find('execution', executionIds);
		}).then(function(result){
			var executionsResult = DataBase.parseResponse('execution', executionIds, result);
			callback(false, executionsResult);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var getExecutionsByTraining = function(training, callback){
		
		var executionIds;
		DataBase.query(function (doc) { 
			if(doc._id.indexOf('execution') == 0){
				emit(doc.data.training);
			}
		}, {
			key: training.id,
			limit: 30,
			reduce: true
		}).then(function(result){
			executionIds = getExecutionIds(result);
			return DataBase.rel.find('execution', executionIds);
		}).then(function(result){
			var executionsResult = DataBase.parseResponse('execution', executionIds, result);
			callback(false, executionsResult);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var getExecutionsByTrainingDay = function(trainingId, day, callback){
		
		var executionIds;
		DataBase.query(function (doc) { 
			if(doc._id.indexOf('execution') == 0){
				emit(doc.data.training + doc.data.marker);
			}
		}, {
			key: trainingId + day,
			reduce: true
		}).then(function(result){
			executionIds = getExecutionIds(result);
			return DataBase.rel.find('execution', executionIds);
		}).then(function(result){
			var executionsResult = DataBase.parseResponse('execution', executionIds, result);
			callback(false, executionsResult);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	return {
		create: createExecutionTrainingDay,
		del: deleteExecutionTrainingDay,
		saveTrainingExercice: saveTrainingExercice,
		get: getExecutionTrainingDay,
		save: saveExecutionTrainingDay,
		getExecutionsByUser: getExecutionsByUser,
		getExecutionsByTraining: getExecutionsByTraining,
		getExecutionsByTrainingDay: getExecutionsByTrainingDay
	};
	
}]);