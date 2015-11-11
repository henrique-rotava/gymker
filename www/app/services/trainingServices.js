angular.module('gymker.trainingservices', [])

.factory('TrainingRepository', ['DataBase', function(DataBase){
	
	var convertExercicesToTrainingExercices = function(exercices){
		var trainingExercices = [];
		var exercicesIds = Object.keys(exercices);
		for(var index = 0; index < exercicesIds.length; index++){
			var prop = exercicesIds[index];
		
			var exercice = exercices[prop];
			var trainingExercice = {};
			trainingExercice.intensity = exercice.intensity;
			trainingExercice.exercice = exercice.id;
			trainingExercices.push(trainingExercice);
		}
	
		return trainingExercices;
	};
	
	var addTrainingToUser = function(user, training, propertyName){
		user[propertyName] = user[propertyName] || [];
		user[propertyName].push(training);
	};
	
	var gettingDocumentFromResponse = function(arrayName, id, result){
		var array = result[arrayName];
		if(array){
			for(var index = 0; index < array.length; index++){
				if(array[index].id == id){
					return array[index];
				}
			}
		}
		return undefined;
	};
	
	var save = function(training, callback, messages){
		globalMessages = messages;
		var days = training.days;
		var daysArray = convertDaysToTrainingDays(days);
		
		saveDays(daysArray, function(error, result){
			if(!error){
				
				training.days = result;
				var coachId = training.coach.id || training.coach;
				var athleteId = training.athlete.id || training.athlete;
				var coach;
				var athlete;
			
				if(coachId == athleteId){
					DataBase.rel.find('user', coachId)
					.then(function(result){
					
						coach = gettingDocumentFromResponse('users', coachId, result);
					
						return DataBase.rel.save('training', training);
					}).then(function(result){
						var trainingResult = result.trainings[0];
					
						addTrainingToUser(coach, trainingResult, 'authorTrainings');
						addTrainingToUser(coach, trainingResult, 'trainings');
					
						return DataBase.rel.save('user', coach);
					}).then(function(result){
						return DataBase.rel.find('user', coachId);
					}).then(function(result){
						var user = DataBase.parseResponse('user', coachId, result);
					
						callback(false, user);
					}).catch(function(error){
					
						callback(true, error);
					});
				} else {
					DataBase.rel.find('user', [coachId, athleteId])
					.then(function(result){
					
						coach = gettingDocumentFromResponse('users', coachId, result);
						athlete = gettingDocumentFromResponse('users', athleteId, result);
					
						return DataBase.rel.save('training', training);
					}).then(function(result){
						var trainingResult = result.trainings[0];
					
						addTrainingToUser(coach, trainingResult, 'authorTrainings');
						addTrainingToUser(athlete, trainingResult, 'trainings');
					
						return DataBase.rel.save('user', athlete);
					}).then(function(result){
					
						return DataBase.rel.save('user', coach);
					}).then(function(result){
						return DataBase.rel.find('user', coachId);
					}).then(function(result){
						var user = DataBase.parseResponse('user', coachId, result);
					
						callback(false, user);
					}).catch(function(error){
					
						callback(true, error);
					});
				}
				
			} else {
			
				callback(true, result);
			}
		});
	};
	
	var saveDays = function(days, callback){
		
		var daysPromisses = [];
		function addDayToSave(trainingDay){
		
			daysPromisses.push(trainingDay);
			
			if(daysPromisses.length == days.length){
			
				for(var index = 0; index < daysPromisses.length; index++){
					daysPromisses[index] = DataBase.rel.save('trainingDay', daysPromisses[index]);
				}
				Promise.all(daysPromisses)
				.then(function(results){
					
					var trainingDays = [];
					for(var index = 0; index < results.length; index++){
						var trainingDay = results[index].trainingDays[0];
						trainingDays.push(trainingDay);
					}
				
					callback(false, trainingDays);
				}).catch(function(error){
				
					callback(true, error);
				});
				
			}
		};
		
		var error = false;
		for(var index = 0; index < days.length && !error; index++){
			var day = days[index];
		
			var trainingExercices = convertExercicesToTrainingExercices(day.trainingExercices);
		
			saveExercices(trainingExercices, day, function(error, result, day){
				if(!error){
					day.trainingExercices = result;
					addDayToSave(day);
				}else{
					error = true;
					callback(true, result);
				}
			});
		}
		
	};
	
	var saveExercices = function(exercices, day, callback){
	
		var exercicesPromises = [];
		for(var index = 0; index < exercices.length; index++){
			var trainingExercice = exercices[index];
			exercicesPromises.push(DataBase.rel.save('trainingExercice', trainingExercice));
		}
		
		Promise.all(exercicesPromises)
		.then(function(results){
		
			var trainingExercices = [];
			for(var index = 0; index < results.length; index++){
				var trainingExercice = results[index].trainingExercices[0];
				trainingExercices.push(trainingExercice);
			}
		
			callback(false, trainingExercices, day);
		}).catch(function(error){
		
			callback(true, error);
		});
	};
	
	var convertDaysToTrainingDays = function(days){
		var trainingDays = [];
		var letters = Object.keys(days);
		for(var index = 0; index < letters.length; index++){
			var letter = letters[index];
			var day = days[letter];
			day.marker = letter;
			trainingDays.push(day);
		}
		return trainingDays;
	};
	
	// works for single id (string) and multiple ids (string[])
	var get = function(trainings, callback){
		DataBase.rel.find('training', trainings)
		.then(function(dbresult){
			var response = DataBase.parseResponse('training', trainings, dbresult);
			callback(false, response);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	var updateTrainingDay = function(trainingDay, callback){
		DataBase.rel.save('trainingDay',
			// save the training day
			trainingDay
		).then(function(result){
			return DataBase.rel.find('trainingDay', trainingDay.id);
		}).then(function(result){	
			var dbtrainingDay = DataBase.parseResponse('trainingDay', trainingDay.id, angular.copy(result));
			callback(false, dbtrainingDay);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var addExercicesToDay = function(trainingDay, exercices, callback){
		var trainingExercices = convertExercicesToTrainingExercices(exercices);
		saveExercices(trainingExercices, trainingDay, function(error, exercicesResult, dayResult){
			
			if(!error){
				var newExerciceList = trainingDay.trainingExercices || [];
				trainingDay.trainingExercices = newExerciceList.concat(exercicesResult);
				updateTrainingDay(trainingDay, callback);
			}else{
				callback(true, exercicesResult);
			}
		});
		
	};
	
	return {
		save: save,
		get: get,
		updateTrainingDay: updateTrainingDay,
		addExercicesToDay: addExercicesToDay
	};
	
}]);