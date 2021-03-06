angular.module('gymker.database', [])

.factory('DataBase', [function(){
	
	var localDB = new PouchDB("gymker", {adapter: 'websql'});
	var remoteDB = new PouchDB("http://gymkerdb-henriquerotava.rhcloud.com/gymker", {
		auth: {
		    username: 'gymker',
		    password: 'C0nnect123'
		}
	});
	
	// Listening for database changes
	var changes = localDB.changes({
		since: 'now',
		live: true,
		doc_ids: ['user_2_' + localStorage.getItem('uid')]
	}).on('change', function(change) {
		console.log('Database changed');
		loadUser();
	}).on('error', function (err) {
		console.log('Sync error', err);
	});

	//changes.cancel();

	var sync = function(){
		localDB.sync(remoteDB, {live: true, retry: true});
	}
	
	var install = function(db){
		localDB.get('_design/index').catch(function(error){
			if(error.status == '404'){
		
			}
		});
		
	};
	
	var dbschema = [
	    {
	    	singular: 'user',
	    	plural: 'users',
	    	relations: {
	    		'coachs': {hasMany: {type: 'relationship', options: {async: true}}},
	    		'athletes': {hasMany: {type: 'relationship', options: {async: true}}},
	    		'trainings': {hasMany: {type: 'training', options: {async: true}}},
	    		'authorTrainings': {hasMany: {type: 'training', options: {async: true}}},
	    		'unreadNotifications': {hasMany: 'notification'},
	    		'readNotifications': {hasMany: {type: 'notification', options: {async: true}}},
	    		'sentNotifications': {hasMany: {type: 'notification', options: {async: true}}},
	    	}
	    },
	    {
	    	singular: 'relationship',
	    	plural: 'relationships',
	    	relations: {
	    		'relater': {belongsTo: 'user'},
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
	    	plural: 'trainingDays',
	    	relations: {
	    		'trainingExercices': {hasMany: 'trainingExercice'}
	    	}
	    },
	    {
	    	singular: 'trainingExercice',
	    	plural: 'trainingExercices',
	    	relations: {
	    		'exercice': {belongsTo: 'exercice'}
	    	}
	    },
	    {
	    	singular: 'exercice',
	    	plural: 'exercices'
	    },
	    {
	    	singular: 'notification',
	    	plural: 'notifications',
	    	relations: {
	    		'sender': {belongsTo: 'user'}
	    	}
	    },
	    {
	    	singular: 'execution',
	    	plural: 'executions',
	    	relations: {
	    		'training': {belongsTo: 'training'},
	    		'athlete': {belongsTo: {type: 'user', options: {async: true}}}
	    	}
	    },
	    {
	    	singular: 'vote',
	    	plural: 'votes',
	    	relations: {
		    	'exercice': {belongsTo: {type: 'exercice', options: {async: true}}},
		    	'user': {belongsTo: {type: 'user', options: {async: true}}}
	    	}
	    },
	    {
	    	singular: 'comment',
	    	plural: 'comments',
	    	relations: {
		    	'exercice': {belongsTo: {type: 'exercice', options: {async: true}}},
		    	'user': {belongsTo: {type: 'user', options: {async: true}}}
	    	}
	    },
	    {
	    	singular: 'config',
	    	plural: 'configs'
	    }
	];
	
	var parseSchema = function(){
		var parsedSchema = {};
		for(index in dbschema){
			var item = dbschema[index];
			parsedSchema[item.singular] = item;
			parsedSchema[item.plural] = item;
		}
		return parsedSchema;
	};
	
	var schema = parseSchema();

	var parseResults = function(results){
		for(type in results){
			var items = results[type];
			var mapItems = {};
			for(index in items){
				var item = items[index];
				mapItems[item.id] = item;
			}
			results[type] = mapItems;
		}
		return results;
	};
	
	var recursiveParseResponse = function(type, id, results, schema, control){

		var recursive = function (type, id){

			type = schema[type].plural;
			
			if(!results[type]){
				return id;
			}

			var document = results[type][id];

			if(!document){
				return id;
			}

			if(control[type+id]){
				return control[type+id];
			} else {
				control[type+id] = document;
			}
			
			var relations = schema[type].relations;
			if(relations){
				var properties = Object.keys(relations);
				for(var ind = 0; ind < properties.length; ind++){
					var propertyName = properties[ind];
					var property = document[propertyName];
					if(property){
						var newPropertyValue;
						if(typeof property == 'string'){
							var relationObjectType = relations[propertyName].belongsTo.type || relations[propertyName].belongsTo;
							var resolvedObject = recursive(relationObjectType, property);
							newPropertyValue = resolvedObject;
						} else if (typeof property == 'object'){
							var relationObjectType = relations[propertyName].hasMany.type || relations[propertyName].hasMany;
							var index = 0;
							var size = property.length;
							newPropertyValue = [];
							for(; index < size; index++){
								var relationObjectId = property[index];
								var resolvedObject = recursive(relationObjectType, relationObjectId);
								newPropertyValue.push(resolvedObject);
							}
						}
						document[propertyName] = newPropertyValue;
					}
				}
			}

			return document;
		};
		
		if(angular.isArray(id)){
			// is an array
			var result = [];
			for(var index = 0; index < id.length; index++){
				var document = recursive(type, id[index]);
				// ignore it if was not found
				if(angular.isObject(document)){
					result.push(document);
				}
			}
			return result;
		} else {
			return recursive(type, id);
		}
	}
	
	var parseResponse = function(type, id, results){
		var parsedResults = parseResults(results);
		var control = {};
		return recursiveParseResponse(type, id, parsedResults, schema, control);
	};
	
	var removeReferenceIDs = function(type, document){
		var relations = schema[type].relations;
		if(relations && document){
			var propertyNames = Object.keys(relations);
			for(var index = 0; index < propertyNames.length; index++){
				var propertyName = propertyNames[index];
				var property = document[propertyName];
				if (angular.isArray(property)){
					for(var ind = 0; ind < property.length; ind ++){
						var propertyIndex = property[ind];
						document[propertyName][ind] = propertyIndex.id || propertyIndex;
					}
				} else if (angular.isObject(property)){
					document[propertyName] = document[propertyName].id || document[propertyName];
				}
			}
		}
		return document;
	};
	
	var buildSchema = function(){
		localDB.setSchema(dbschema);
	};
	
	var overrideRelationFunction = function(functionName){
		var nativeFunction = dataBase.rel[functionName];
		var extendedFunction = function(type, document){
			var cleanDocument = removeReferenceIDs(type, document);
			return nativeFunction(type, cleanDocument);
		}
		dataBase.rel[functionName] = extendedFunction;
	};
	
	var startUp = function(){
		buildSchema();
		sync();
		install();
		overrideRelationFunction('save');
		overrideRelationFunction('del');
	};
	
	// TODO revoke global access
	dataBase = localDB;
	dataBase.startUp = startUp;
	dataBase.parseResponse = parseResponse;
	dataBase.removeReferenceIDs = removeReferenceIDs;
	
	dataBase.on('error', function (err) { console.log(err); });
	
	return dataBase;
	
}]);

var installViews = function(db){
	var ddoc = {
		_id: '_design/my_index',
		views: {
			by_type: {
				map: function (doc) { 
					emit(doc.type); 
				}.toString()
			},
			executionsByAthlete: {
				map: function (doc) { 
					if(doc._id.indexOf('execution') == 0){
						emit(doc.data.athlete);
					}
				}.toString()
			},
			executionsByTraining: {
				map: function (doc) { 
					if(doc._id.indexOf('execution') == 0){
						emit(doc.data.training);
					}
				}.toString()
			},
			userAuthentication: {
				map: function (doc) { 
					if(doc._id.indexOf('user') == 0){
						emit(doc.data.email + doc.data.password);
						emit(doc.data.phone + doc.data.password);
					}
				}.toString()
			}
			
		}
	};
	
	db.put(ddoc).then(function (result) {
		console.log(result);
	}).catch(function (err) {
		console.error(err);
	});
}

