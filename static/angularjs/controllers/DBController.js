 /* DB controller controller
  * for handling pouchdb and google drive database CRUD operations 
  * uses pouchdbservice & googledriveDBservice to store user info for entire session 
  */
 keepassApp.controller('DBController', function ($scope, $rootScope, $pouchDB, $googledriveDB, $filter) {


     // Define all variables used here
     var record = null;
     var resetForm = null;
     var dataUpToDate = null;
     var syncDB = null;
     var pouchDBlastupdated = null;
     var googledriveDBlastupdated = null;
     // constants for database sync
     var databases_uptodate = 1;
     var databases_pouchdb_uptodate = 2;
     var databases_gd_uptodate = 3;
     var TIME_ZONE_DIFF = 240;
     // Initing in init pouchdb()
     poucdDBrevid = null;
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


     // Password generator
     $scope.passwordLength = 12;
     $scope.addUpper = true;
     $scope.addNumbers = true;
     $scope.addSymbols = false;

     // After user sign in is successful, broadcast msg from googledriveauth
     $scope.$on('signedIn', function (event) {
         console.log("After signedin received in DBController");
         // Initialize pouchdb
         initPouchDB();

     });

     // After user sign out is successful, broadcast msg from googledriveauth 
     $scope.$on('signedOut', function (event) {
         console.log("After signedout received in DBController");

     });

     // 1. Call googledriveDB service to get info about googledriveDB and see which one is udpated and sync accordingly
     function initPouchDB() {
         // Start pouchdb service
         $pouchDB.startListening();
         //$pouchDB.destroy();
         // Check if there is googledriveDB and intialize fileID
         $googledriveDB.isGoogleDriveFileExists().then(function (fileId) {
             console.log("after setting id in db controller" + fileId);
             if (fileId === null) {
                 console.log("file doesn't exist");
             } else {
                 console.log("fetching last updated files");
                 //as of now assuming this works will move forward and come back
                 // If file exists get last updated info of pouchdb
                 $pouchDB.getLastUpdatedTimeStamp().then(function (lastupdated) {
                              
                     pouchDBlastupdated = lastupdated.value;
                     poucdDBrevid = lastupdated._rev
                     console.log("last pouchdb updated" + pouchDBlastupdated);
                     // Get last updated info GoogleDB
                    $googledriveDB.getLastUpdatedTimeStamp().then(function (lastupdated) {
                        googledriveDBlastupdated = lastupdated
                        console.log("last google updated" + googledriveDBlastupdated);
                    });
                 });
             }
             //temporarily 
            $scope.init();
         });

         
     }

     /*
     get current time
     */
     function getCurrentTime() {
         return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
     }

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
     localDBUpToDate = function () {
         console.log("comparing "+pouchDBlastupdated+googledriveDBlastupdated);
         
         //if pouchDBlastupdated is null then we are not fetching googledriveDBlastupdated as of now so it will be null and returns true true
         
         var d1 = new Date(pouchDBlastupdated);
         var d2 = new Date(googledriveDBlastupdated);
         
         //will consider either of db outdated only if time difference is more than 10 minutes
         console.log("time difference");
         var diff = Math.abs(d1 - d2);
         var minutes = Math.floor((diff/1000)/60);
         console.log(diff);
         console.log(minutes);
         console.log("After time zone diff"+Math.abs(TIME_ZONE_DIFF - minutes));
         //considering time difference b/w EST and google drive time zone
         if(Math.abs(TIME_ZONE_DIFF - minutes) <= 10){
             return databases_uptodate;
         }

         return databases_pouchdb_uptodate;
     };

     syncDB = function (recently_updated_data) {
         var recently_updated_data_json = null;
         console.log("saving to drive" + recently_updated_data.length);

         //convert it into json format
         recently_updated_data_json = JSON.stringify(recently_updated_data);
         console.log(recently_updated_data_json);

         //check if driveisuptodate with local pouchdb else sync both
         if (localDBUpToDate() == databases_uptodate) {
            console.log("data up to date");
         }else if (localDBUpToDate() == databases_pouchdb_uptodate){
             //should check which has latest data
             console.log('data not in sync');
             // Update google drive with new data
             // Calling service to save to drive
             $googledriveDB.saveToDrive(recently_updated_data_json);
             // Update local pouchdb date so that next time we can find out both are in sync ( less than 10 min diff)
             $googledriveDB.getLastUpdatedTimeStamp().then(function(response){
               //  console.log("setting pouchdb lastupdated time after gd last updated time"+response);
                $pouchDB.setLastUpdatedTimeStamp(getCurrentTime(),poucdDBrevid);
             });
         } else {
             console.log("Outdated data in local db update from googledrive");
             //should get data from google drive and update local pouchdb
             
        }

     };

     // 2. Once the sync of pouchdb and googledrive is done init UI
     $scope.init = function () {

         $scope.data = [];
         // Init state of a system
         console.log("init state");
         // Get all database records and push into list output

         $pouchDB.getAll().then(function (response) {
             console.log("getting all docs success");
             console.log(response.rows);
             //console.log(response.rows[1]);
             $scope.data.push(response.rows);
             console.log(response.rows.length);
             if (response.rows.length > 0) {
                 syncDB(response.rows);
             }

             // Reset form
             resetForm();
             // $scope.data.push(JSON.stringify(response.rows));
         }, function (error) {
             console.log("ERROR -> " + error);
         });

     };

     // Create submitkeepassForm() function. This will be called when user submits the form
     $scope.submitkeepassForm = function () {

         $scope.myTxt = "You clicked submit!";
         console.log($scope);
         //saving the record
         if ($scope.record.name) {
             console.log("keepass record saved" + $scope.record.name);
             console.log("keepass record saved" + $scope.record.recordtype);

             //store the record locally
             if ($scope.record.recordtype == "new") {
                 record = {
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

     // Store the data
     var storeData = function (record) {
         console.log("storing data locally" + record._id);
         console.log(record);
         if (record.created_time == null) {
             record.created_time = getCurrentTime();
             record.updated_time = getCurrentTime();
         }

         $pouchDB.save(record).then(function (response) {
             console.log("saving success");
             console.log(response);
             //update lastupdated timestamp
             $pouchDB.setLastUpdatedTimeStamp(getCurrentTime(), poucdDBrevid);
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

 });