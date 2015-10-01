angular.module('gymker.trainingservices', [])

.factory('TrainingRepository', ['DataBase', function(DataBase){
	
	var convertExercicesToTrainingExercices = function(exercices){
		var trainingExercices = [];
		for(prop in exercices){
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
	
	var save = function(training, callback){
		
		var days = training.days;
		var daysArray = convertDaysToTrainingDays(days);
		
		saveDays(daysArray, function(error, result){
			if(!error){
				
				training.days = result;
				var coachId = training.coach.id || training.coach;
				var athleteId = training.athlete.id || training.athlete;
				var coach;
				var athlete;
				console.log('athleteId', athleteId, 'coachId', coachId);
				
				if(coachId == athleteId){
					DataBase.rel.find('user', coachId)
					.then(function(result){
						console.log('users found', result);
						coach = gettingDocumentFromResponse('users', coachId, result);
						console.log('coach', coach);
						console.log('training', training);
						return DataBase.rel.save('training', training);
					}).then(function(result){
						var trainingResult = result.trainings[0];
						console.log('training saved', trainingResult);
						addTrainingToUser(coach, trainingResult, 'authorTrainings');
						addTrainingToUser(coach, trainingResult, 'trainings');
						console.log('saving coach');
						return DataBase.rel.save('user', coach);
					}).then(function(result){
						return DataBase.rel.find('user', coachId);
					}).then(function(result){
						var user = DataBase.parseResponse('user', coachId, result);
						console.log('coach saved', user);
						callback(false, user);
					}).catch(function(error){
						console.error('error saving training/users', error);
						callback(true, error);
					});
				} else {
					DataBase.rel.find('user', [coachId, athleteId])
					.then(function(result){
						console.log('users found', result);
						coach = gettingDocumentFromResponse('users', coachId, result);
						athlete = gettingDocumentFromResponse('users', athleteId, result);
						console.log('coach', coach);
						console.log('athelete', athlete);
						console.log('training', training);
						return DataBase.rel.save('training', training);
					}).then(function(result){
						var trainingResult = result.trainings[0];
						console.log('training saved', trainingResult);
						addTrainingToUser(coach, trainingResult, 'authorTrainings');
						addTrainingToUser(athlete, trainingResult, 'trainings');
						console.log('saving athlete');
						return DataBase.rel.save('user', athlete);
					}).then(function(result){
						console.log('saving coach');
						return DataBase.rel.save('user', coach);
					}).then(function(result){
						return DataBase.rel.find('user', coachId);
					}).then(function(result){
						var user = DataBase.parseResponse('user', coachId, result);
						console.log('coach saved', user);
						callback(false, user);
					}).catch(function(error){
						console.error('error saving training/users', error);
						callback(true, error);
					});
				}
				
			} else {
				console.log('not saving training');
				callback(true, result);
			}
		});
	};
	
	var saveDays = function(days, callback){
		console.log('days to save', days);
		
		var daysPromisses = [];
		function addDayToSave(trainingDay){
			console.log('adding training day to be saved', trainingDay);
			daysPromisses.push(DataBase.rel.save('trainingDay', day));
			
			if(daysPromisses.length == days.length){
				console.log('time to save training days');
				Promise.all(daysPromisses)
				.then(function(results){
					var trainingDays = [];
					for(var index = 0; index < results.length; index++){
						var trainingDay = results[index].trainingDays[0];
						trainingDays.push(trainingDay);
					}
					console.log('saved training days', trainingDays);
					callback(false, trainingDays);
				}).catch(function(error){
					console.error('error saving training days', error);
					callback(true, error);
				});
				
			}
		};
		
		var error = false;
		for(var index = 0; index < days.length && !error; index++){
			var day = days[index];
			var trainingExercices = convertExercicesToTrainingExercices(day.trainingExercices);
			saveExercices(trainingExercices, function(error, result){
				if(!error){
					day.trainingExercices = result;
					addDayToSave(day);
				}else{
					console.error('error! Stop loop');
					error = true;
					callback(true, result);
				}
			});
		}
		
	};
	
	var saveExercices = function(exercices, callback){
		console.log("exercices to save", exercices);
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
			console.log("saved training exercices", trainingExercices);
			callback(false, trainingExercices);
		}).catch(function(error){
			console.error('error saving training exercices', error);
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
	
	return {
		save: save,
		get: get
	};
	
}]);