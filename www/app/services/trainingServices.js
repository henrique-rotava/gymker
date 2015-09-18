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
	
	var save = function(training, callback){
		
		var days = training.days;
		var daysCount = Object.keys(days).length;
		var athlete = training.athlete;
		athlete.trainings = athlete.trainings || [];
		var coach = training.coach;
		coach.authorTrainings = coach.authorTrainings || [];
		
		console.log('Days quantity: ', daysCount);
		training.days = [];
		training.athlete = training.athlete.id;
		training.coach = training.coach.id;
		
		for(letter in days){
			console.log('Day: ', letter);
			var day = days[letter];
			
			var trainingExercices = convertExercicesToTrainingExercices(day.trainingExercices);
			day.marker = letter;
			day.trainingExercices = [];
			
			var exercicesPromises = [];
			for(index in trainingExercices){
				var trainingExercice = trainingExercices[index];
				exercicesPromises.push(DataBase.rel.save('trainingExercice', trainingExercice));
			}
			
			Promise.all(exercicesPromises)
			.then(function(results){
				
				for(index in results){
					var trainingExercice = results[index].trainingExercices[0];
					console.log('Training exercice was saved', trainingExercice);
					day.trainingExercices.push(trainingExercice.id);
				}
				console.log('Saving trainingday', day);
				return DataBase.rel.save('trainingDay', day);
				
			}).then(function(results){
				var trainingDay = results.trainingDays[0];
				training.days.push(trainingDay.id);
				if(training.days.length == daysCount){
					console.log('saving training');
					DataBase.rel.save('training', training)
					.then(function(results){
						var training = results.trainings[0];
						
						coach.authorTrainings.push(training.id);
						athlete.trainings.push(training.id);
						console.log('saving coach', coach);
						
						return DataBase.rel.save('user', coach);
					}).then(function(){
						console.log('saving athlete', athlete);
						return DataBase.rel.save('user', athlete);
					});
				}
			}).catch(function(err){
				console.log(err);
			});
		}
		
	};
	
	var getTrainings = function(trainings, callback){
		DataBase.rel.find('training', trainings)
		.then(function(dbresult){
//			console.log(dbresult);
			var response = DataBase.parseResponse('training', trainings, dbresult);
//			console.log(response);
			callback(false, response);
		}).catch(function(error){
			callback(true, error);
		});
	};
	
	return {
		save: save,
		getTrainings: getTrainings
	};
	
}]);