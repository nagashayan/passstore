 //main controller controller
 keepassApp.controller('keepassController', function ($scope, $rootScope, $http, $pouchDB, $filter, $googledrive) {

     // Define all variables used here
     var record = null;
     var resetForm = null;
     var dataUpToDate = null;
     var saveToDrive = null;
     var log = null;
     var LOG_ENABLED = true;

     $scope.myTxt = 'You have not yet clicked submit';

     // Set record object properties
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

     // Start pouchdb service
     $pouchDB.startListening();

     // Reset form to blank state
     resetForm = function () {

         $scope.record.sname = '';
         $scope.record.url = '';
         $scope.record.name = '';
         $scope.record.password = '';
         $scope.record.recordtype = 'new';
         record = null;
     };

     /* Check if data in drive and local db is in sync or no 
      * return true if sync 
      * false if not in sync
      */
     dataUpToDate = function () {
         return false;
     };

     saveToDrive = function (recently_updated_data) {
         var recently_updated_data_json = null;
         log("saving to drive"+recently_updated_data.length);

         //convert it into json format
         recently_updated_data_json = JSON.stringify(recently_updated_data);
         log(recently_updated_data_json);
         log(recently_updated_data_json);

         log(recently_updated_data_json.length);

         //check if driveisuptodate with local pouchdb else sync both
         if (!dataUpToDate()) {
             //should check which has latest data
             log('data not in sync');


             $rootScope.$broadcast('saveToDrive', {
                 data: recently_updated_data_json
             });

             log('sending msg');
         }
         else{
             console.log("Outdated data - not synching with GD");
         }

     };

     $scope.init = function () {


         //$pouchDB.destroy();
         //log("destroyed database");
         $scope.data = [];
         // Init state of a system
         log("init state");
         // Get all database records and push into list output

         $pouchDB.getAll().then(function (response) {
             log("getting all docs success");
             log(response.rows);

             if (response.rows.length > 0){
                 saveToDrive(response.rows);
             }

             /*  $pouchDB.bulkGetAll().then(function(resp) {
                  log("bulk get all sucess");
                  log(resp);
                 }, function(error) {
                     log("ERROR11 -> " + error);
                 });
             */
             //try saving this response - to test as if we got this from google drive
             /* $pouchDB.putAll(JSON.parse(response.rows)).then(function(response) {
              log("putting success");
              log(response);
              }, function(error) {
                  log("ERROR -> " + error);
              });

*/

             log(response.rows[1]);
             $scope.data.push(response.rows);
             log($scope.data[0]);

             // Reset form
             resetForm();
             // $scope.data.push(JSON.stringify(response.rows));
         }, function (error) {
             log("ERROR -> " + error);
         });

     };

     /* angular.element(document).ready(function () {
         $scope.init();
     });*/

     // Create submitkeepassForm() function. This will be called when user submits the form
     $scope.submitkeepassForm = function () {

         $scope.myTxt = "You clicked submit!";
         log($scope);
         //saving the record
         if ($scope.record.name) {
             log("keepass record saved" + $scope.record.name);
             log("keepass record saved" + $scope.record.recordtype);

             //store the record locally
             if ($scope.record.recordtype == "new") {
                 record = {
                     sname: $scope.record.sname,
                     url: $scope.record.url,
                     name: $scope.record.name,
                     password: $scope.record.password
                 };
                 log("creating");
                 storeData(record);

             } else {
                 //update
                 log("updating");
                 log($scope.record);
                 updateData($scope.record);
             }


         }

     };

     //store the data
     var storeData = function (record) {
         log("storing data locally" + record.id + record._id);
         log(record);
         if (record.created_time == null) {
             record.created_time = getCurrentTime();
             record.updated_time = getCurrentTime();
         }

         $pouchDB.save(record).then(function (response) {
             log("saving success");
             log(response);
             //reload database
             $scope.init();

         }, function (error) {
             log("ERROR -> " + error);
         });

     }

     //remove the data
     $scope.updateItem = function (record) {

         log("updating form" + record.doc._id + record.doc._rev);

         $scope.record = {

             sname: record.doc.sname,
             url: record.doc.url,
             name: record.doc.name,
             password: record.doc.password,
             recordtype: record.doc._id
         };
     }

     var updateData = function (updatedrecord) {

         log("updating data locally" + updatedrecord.recordtype);
         log(updatedrecord);

         $pouchDB.get(updatedrecord.recordtype).then(function (response) {
             log("getting success");
             log(response);

             //udate record with new values

             response.sname = updatedrecord.sname;
             response.url = updatedrecord.url;
             response.name = updatedrecord.name;
             response.password = updatedrecord.password;

             log("before store data");
             log(response);
             response.updated_time = getCurrentTime();
             //save the updated record
             storeData(response);

         }, function (error) {
             log("ERROR -> " + error);
         });


     }

     //remove the data
     $scope.removeItem = function (record) {

         log("removing data locally" + record.doc._id + record.doc._rev);


         $pouchDB.delete(record.doc._id, record.doc._rev).then(function (response) {
             log("removing success");

             //reloading database
             $scope.init();

         }, function (error) {
             log("ERROR -> " + error);
         });


     }


     // Password generator
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
         log("inside handle client");
         $googledrive.handleClientLoad();
     }

     $scope.$on('initialize', function (event) {
         console.log("received init");
         $scope.init();
     });

     // For controlling display of console logs
     log = function (text) {
         if (LOG_ENABLED) {
             console.log(text);
         }
     }

 });