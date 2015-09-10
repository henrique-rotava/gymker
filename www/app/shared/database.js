angular.module('gymker.database', [])

.factory('DataBase', [function(){
	
	var localDB = new PouchDB("gymker");
	var remoteDB = new PouchDB("https://gymker.iriscouch.com/gymker-test");

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
	    	singular: 'user',
	    	plural: 'users',
	    	relations: {
	    		'coachs': {hasMany: {type: 'relationship', options: {async: true}}},
	    		'athletes': {hasMany: {type: 'relationship', options: {async: true}}},
	    		'trainings': {hasMany: 'training'}
	    	}
	    },
	    {
	    	singular: 'relationship',
	    	plural: 'relationships',
	    	relations: {
	    		'person': {belongsTo: 'user'},
	    		'related': {belongsTo: 'user'}
	    	}
	    },
	    {
	    	singular: 'training',
	    	plural: 'trainings',
	    	relations: {
	    		'athlete': {belongsTo: 'user'},
	    		'coach': {belongsTo: 'user'},
	    		'days': {hasMany: 'trainingDay'}
	    	}
	    },
	    {
	    	singular: 'trainingDay',
	    	plural: 'trainingDay',
	    	relations: {
	    		'trainingExercices': {hasMany: 'trainingExercice'}
	    	}
	    },
	    {
	    	singular: 'trainingExercice',
	    	plural: 'trainingExercices',
	    	relations: {
	    		'trainingDay': {belongsTo: 'trainingDay'},
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