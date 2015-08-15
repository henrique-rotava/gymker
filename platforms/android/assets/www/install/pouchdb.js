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

localDB.query('app_index/by_name', {
  //limit: 0 // don't return any results
}).then(function (res) {
  console.log("success querying the index", res);
}).catch(function (err) {
  console.log("error querying the index", err);
});