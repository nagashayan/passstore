 //main controller controller
 keepassApp.controller("keepassController", function ($scope, $rootScope, $http, $pouchDB, $filter, $googledrive) {

     $scope.myTxt = "You have not yet clicked submit";

     //set record object properties
     $scope.record = {

         sname: null,
         url: null,
         name: null,
         password: null,
         recordtype: 'new',
         created_time: null,
         updated_time: null

     };


     $scope.data = [];

     //start pouchdb service
     $pouchDB.startListening();

     /* check if data in drive and local db is in sync or no 
      * return true if sync 
      * false if not in sync
      */
     var dataUpToDate = function () {
         return false;
     }

     var saveToDrive = function (recently_updated_data) {

         console.log("saving to drive");

         //convert it into json format
         recently_updated_data_json = JSON.stringify(recently_updated_data);
         console.log(recently_updated_data_json);

         //check if driveisuptodate with local pouchdb else sync both
         if (!dataUpToDate()) {

             console.log("data not in sync");

         }

     }

     $scope.init = function () {


         //$pouchDB.destroy();
         //console.log("destroyed database");
         $scope.data = [];
         //init state of a system
         console.log("init state");
         //get all database records and push into list output

         $pouchDB.getAll().then(function (response) {
             console.log("getting all docs success");
             console.log(response.rows);
             saveToDrive(response.rows);

             /*  $pouchDB.bulkGetAll().then(function(resp) {
                  console.log("bulk get all sucess");
                  console.log(resp);
                 }, function(error) {
                     console.log("ERROR11 -> " + error);
                 });
             */
             //try saving this response - to test as if we got this from google drive
             /* $pouchDB.putAll(JSON.parse(response.rows)).then(function(response) {
              console.log("putting success");
              console.log(response);
              }, function(error) {
                  console.log("ERROR -> " + error);
              });

*/

             console.log(response.rows[1]);
             $scope.data.push(response.rows);
             console.log($scope.data[0]);

             //reset form
             resetForm();
             // $scope.data.push(JSON.stringify(response.rows));
         }, function (error) {
             console.log("ERROR -> " + error);
         });


     }
     angular.element(document).ready(function () {
         $scope.init();
     });

     //5. create submitkeepassForm() function. This will be called when user submits the form
     $scope.submitkeepassForm = function () {

         $scope.myTxt = "You clicked submit!";
         console.log($scope);
         //saving the record
         if ($scope.record.name) {
             console.log("keepass record saved" + $scope.record.name);
             console.log("keepass record saved" + $scope.record.recordtype);



             //store the record locally
             if ($scope.record.recordtype == "new") {
                 var record = {
                     sname: $scope.record.sname,
                     url: $scope.record.url,
                     name: $scope.record.name,
                     password: $scope.record.password
                 };
                 console.log("creating");
                 storeData(record);

             } else {
                 //update
                 console.log("updating");
                 console.log($scope.record);
                 updateData($scope.record);
             }


         }

     };

     //store the data
     var storeData = function (record) {
         console.log("storing data locally" + record.id + record._id);
         console.log(record);
         if (record.created_time == null) {
             record.created_time = getCurrentTime();
             record.updated_time = getCurrentTime();
         }

         $pouchDB.save(record).then(function (response) {
             console.log("saving success");
             console.log(response);
             //reload database
             $scope.init();
         }, function (error) {
             console.log("ERROR -> " + error);
         });

     }

     //remove the data
     $scope.updateItem = function (record) {

         console.log("updating form" + record.doc._id + record.doc._rev);


         $scope.record = {

             sname: record.doc.sname,
             url: record.doc.url,
             name: record.doc.name,
             password: record.doc.password,
             recordtype: record.doc._id
         };


     }

     var updateData = function (updatedrecord) {

         console.log("updating data locally" + updatedrecord.recordtype);
         console.log(updatedrecord);

         $pouchDB.get(updatedrecord.recordtype).then(function (response) {
             console.log("getting success");
             console.log(response);

             //udate record with new values

             response.sname = updatedrecord.sname;
             response.url = updatedrecord.url;
             response.name = updatedrecord.name;
             response.password = updatedrecord.password;

             console.log("before store data");
             console.log(response);
             response.updated_time = getCurrentTime();
             //save the updated record
             storeData(response);

         }, function (error) {
             console.log("ERROR -> " + error);
         });


     }

     //remove the data
     $scope.removeItem = function (record) {

         console.log("removing data locally" + record.doc._id + record.doc._rev);


         $pouchDB.delete(record.doc._id, record.doc._rev).then(function (response) {
             console.log("removing success");

             //reloading database
             $scope.init();

         }, function (error) {
             console.log("ERROR -> " + error);
         });


     }

     //reset form to blank state
     var resetForm = function () {

         $scope.record.sname = '';
         $scope.record.url = '';
         $scope.record.name = '';
         $scope.record.password = '';
         $scope.record.recordtype = 'new';
         record = null;
     };



     /*

     password generator

     */

     $scope.passwordLength = 12;
     $scope.addUpper = true;
     $scope.addNumbers = true;
     $scope.addSymbols = false;

     $scope.createPassword = function () {
         var lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
         var upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
         var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
         var symbols = ['!', '"', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
         var finalCharacters = lowerCharacters;
         if ($scope.addUpper) {
             finalCharacters = finalCharacters.concat(upperCharacters);
         }
         if ($scope.addNumbers) {
             finalCharacters = finalCharacters.concat(numbers);
         }
         if ($scope.addSymbols) {
             finalCharacters = finalCharacters.concat(symbols);
         }
         var passwordArray = [];
         for (var i = 1; i < $scope.passwordLength; i++) {
             passwordArray.push(finalCharacters[Math.floor(Math.random() * finalCharacters.length)]);
         };
         $scope.record.password = passwordArray.join("");
     };


     /*
     get current time
     */
     var getCurrentTime = function () {
         return $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss')
     }

     $scope.handleclient = function () {
         console.log("inside handle client");
         $googledrive.handleClientLoad();
     }

 });