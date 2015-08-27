angular.module('gymker.database', [])

.factory('DataBase', [function(){
	
	var localDB = new PouchDB("gymkerr");
	var remoteDB = new PouchDB("http://localhost:5984/gymkerr");
	
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
	
	var dataBase = {
		db: localDB,
		remoteDB: remoteDB,
		sync: sync,
		install: install
	};
	
	return dataBase;
	
}]);