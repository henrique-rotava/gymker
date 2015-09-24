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
				  //console.log("index saved");
				}).catch(function (err) {
				  //console.log("error saving the index", err);
				});
		
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
			
//			console.log('Getting', type, id);
			if(!results[type]){
//				console.log('type not found', type);
				return id;
			}

			var document = results[type][id];
//			console.log('Found document', document);

			if(!document){
				return id;
			}

			if(control[type+id]){
				return control[type+id];
			} else {
				control[type+id] = document;
			}
			
			var relations = schema[type].relations;
//			console.log('Relations ', relations, 'for type', type);
			if(relations){
				var properties = Object.keys(relations);
//				console.log('Properties ', properties, 'for type', type);
				for(var ind = 0; ind < properties.length; ind++){
					var propertyName = properties[ind];
					var property = document[propertyName];
//					console.log('Property', propertyName, property, 'for type', type);
					if(property){
						if(typeof property == 'string'){
							var relationObjectType = relations[propertyName].belongsTo.type || relations[propertyName].belongsTo;
							var resolvedObject = recursive(relationObjectType, property);
//							console.log('Assigning', propertyName, resolvedObject);
							document[propertyName] = resolvedObject;
						} else if (typeof property == 'object'){
							var relationObjectType = relations[propertyName].hasMany.type || relations[propertyName].hasMany;
							var index = 0;
							var size = property.length;
							for(; index < size; index++){
								var relationObjectId = property[index];
								var resolvedObject = recursive(relationObjectType, relationObjectId);
								property[index] = resolvedObject;
							}
						}
					}
				}
			}

			return document;
		};
		
		if(typeof id == 'object'){
			// is an array
			var result = [];
			for(var index = 0; index < id.length; index++){
				result.push(recursive(type, id[index]));
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
//		console.log('cópia 1', angular.copy(document));
		var relations = schema[type].relations;
		if(relations){
//			console.log('relations', relations);
			var propertyNames = Object.keys(relations);
//			console.log('propertyNames', propertyNames);
			for(var index = 0; index < propertyNames.length; index++){
				var propertyName = propertyNames[index];
//				console.log('propertyName', propertyName);
				var property = document[propertyName];
				if (angular.isArray(property)){
//					console.log('is array');
//					console.log('property value', document[propertyName]);
					for(var ind = 0; ind < property.length; ind ++){
						var propertyIndex = property[ind];
//						console.log('property index value', propertyIndex);
						document[propertyName][ind] = propertyIndex.id || propertyIndex;
//						console.log('new property value', document[propertyName][ind]);
					}
				} else if (angular.isObject(property)){
//					console.log('is object');
//					console.log('property value', document[propertyName]);
					document[propertyName] = document[propertyName].id || document[propertyName];
//					console.log('new property value', document[propertyName]);
				}
			}
		}
//		console.log('cópia 2', angular.copy(document));
		return document;
	};
	
	var buildSchema = function(){
		localDB.setSchema(dbschema);
	};
	
	var overrideSave = function(){
		var nativeSave = dataBase.rel.save;
		var extendedSave = function(type, document){
			var cleanDocument = removeReferenceIDs(type, document);
			return nativeSave(type, cleanDocument);
		}
		dataBase.rel.save = extendedSave;
	};
	
	var startUp = function(){
		buildSchema();
		sync();
		install();
		overrideSave();
	};
	
	var dataBase = localDB;
	dataBase.startUp = startUp;
	dataBase.parseResponse = parseResponse;
	dataBase.removeReferenceIDs = removeReferenceIDs;
	
	
	return dataBase;
	
}]);