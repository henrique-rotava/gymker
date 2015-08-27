angular.module('gymker.database', [])

.factory('DataBase', [function(){
	
	var localDB = new PouchDB("gymker");
	var remoteDB = new PouchDB("http://localhost:5984/gymker");
	
	var sync = function(){
		localDB.sync(remoteDB, {live: true, retry: true});
	}
	
	var install = function(){
		localDB.get('_design/index').catch(function(error){
			if(error.status == '404'){
				
				var ddoc = {
				  _id: "_design/index",
				  views: {
				    by_type: {
				      map: function (doc) { 
				      	emit(doc.type); 
				      }.toString()
				    }
				  }
				};
				
				localDB.put(ddoc).then(function () {
				  console.log("index saved");
				}).catch(function (err) {
				  console.log("error saving the index", err);
				});
		
			}
		});
		
	};
	
	var schema = [
	    {
	    	singular: 'athlete',
	    	plural: 'athletes',
	    	relations: {
	    		'coachs': {hasMany: 'coach'},
	    		'trainings': {hasMany: 'training'}
	    	}
	    },
	    {
	    	singular: 'coach',
	    	plural: 'coachs',
	    	relations: {
	    		'athletes': {hasMany: 'athlete'},
	    		'trainings': {hasMany: 'training'}
	    	}
	    },
	    {
	    	singular: 'training',
	    	plural: 'trainings',
	    	relations: {
	    		'athlete': {belongsTo: 'athlete'},
	    		'coach': {belongsTo: 'coach'},
	    		'trainingExercices': {hasMany: 'trainingExercice'}
	    	}
	    },
	    {
	    	singular: 'trainingExercice',
	    	plural: 'trainingExercices',
	    	relations: {
	    		'training': {belongsTo: 'training'},
	    		'exercice': {belongsTo: 'exercice'}
	    	}
	    },
	    {
	    	singular: 'exercice',
	    	plural: 'exercices'
	    }
	];
	
	var buildSchema = function(){
		localDB.setSchema(schema);
	};
	
	var startUp = function(){
		buildSchema();
		sync();
		install();
	};
	
	var dataBase = localDB;
	dataBase.startUp = startUp;
	
	return dataBase;
	
}]);