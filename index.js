   var movies = new PouchDB('Movies');


   //create or link remote database
   // remote CouchDB
   var remoteDB = new PouchDB('http://localhost:5984/movies')
   //sync from remote db to local db
   // replicates once
   movies.sync(remoteDB);

   movies.info().then(function (info) {
     document.getElementById('display').innerHTML = 'We have a database: ' + JSON.stringify(info);


     movies
       .put({
         _id: 'id1',
         title: 'The Dark Knight Rises',
         director: 'Christopher Nolan'
       }).then(function (response) {
         console.log("Success", response)
       }).then(function (err) {
         console.log("Error", err)
       })

     movies
       .put({
         _id: 'id2',
         title: 'The Dark Knight Rises',
         director: 'Christopher Nolan'
       }).then(function (response) {
         console.log("Success", response)
       }).then(function (err) {
         console.log("Error", err)
       })

     // Returns a promise
     movies.bulkDocs([{
         _id: 'easy-a',
         title: "Easy A",
         // other attribues
       },
       /* {
          _id: 'black-swan',
          title: 'Black Swan',
          // ...
        }*/
     ]);

     movies.allDocs({
         include_docs: true
       })
       .then(function (docs) {
         console.log(docs);
         document.getElementById('display').innerHTML += '<br>We have a more info : ' + JSON.stringify(docs);
       })

     /*
     //sync to remotedb
     movies
       .replicate
       .to(remoteDB)
       .on('complete', function () {
        console.log("synched to remoted db");
         // local changes replicated to remote
       }).on('error', function (err) {
         // error while replicating
         console.log("synched to remoted db failed");
       })
     */

     console.log("after inserting")

   });