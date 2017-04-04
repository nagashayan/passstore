
    //main controller controller
    keepassApp.controller("keepassController", function($scope, $rootScope, $http, $pouchDB) {

        $scope.myTxt = "You have not yet clicked submit";

        //set record object properties
        $scope.record = {

            sname: null,
            url: null,
            name: null,
            password: null,
            recordtype: 'new'

        };


        $scope.data = [];

        //start pouchdb service
        $pouchDB.startListening();

        $scope.init = function(){

         $scope.data = [];
         //init state of a system
          console.log("init state");
          //get all database records and push into list output

          $pouchDB.getAll().then(function(response) {
            console.log("getting success");
            console.log(response.rows);
            $scope.data.push(response.rows);
            console.log($scope.data[0]);

            //reset form
            resetForm();
           // $scope.data.push(JSON.stringify(response.rows));
          }, function(error) {
              console.log("ERROR -> " + error);
          });


        }
        angular.element(document).ready(function () {
         $scope.init();
   });


       //frame the variable and return

       $scope.initvar = function(index) {

           console.log("initing");

           return "show_"+index+" =  true";

       }

        //5. create submitkeepassForm() function. This will be called when user submits the form
        $scope.submitkeepassForm = function() {

            $scope.myTxt = "You clicked submit!";
            console.log($scope);
            //saving the record
            if ($scope.record.name) {
                console.log("keepass record saved" + $scope.record.name);
                console.log("keepass record saved" + $scope.record.recordtype);



                //store the record locally
                if ($scope.record.recordtype == "new"){
                 var record = {
                     sname: $scope.record.sname,
                     url: $scope.record.url,
                     name: $scope.record.name,
                     password: $scope.record.password
                 };
                  console.log("creating");
                  storeData(record);


                 }
                 else{
                  //update
                  console.log("updating");
                  console.log($scope.record);
                  updateData($scope.record);
                 }


            }

        };




        //store the data
        var storeData = function(record) {
            console.log("storing data locally"+record.id+record._id);
             console.log(record);
            $pouchDB.save(record).then(function(response) {
              console.log("saving success");
              console.log(response);
              //reload database
              $scope.init();
            }, function(error) {
                console.log("ERROR -> " + error);
            });

        }

        //remove the data
        $scope.updateItem = function(record) {

            console.log("updating form"+record.doc._id+record.doc._rev);


             $scope.record = {

              sname: record.doc.sname,
              url: record.doc.url,
              name: record.doc.name,
              password: record.doc.password,
              recordtype: record.doc._id
             };


        }

        var updateData = function(updatedrecord) {

            console.log("updating data locally"+updatedrecord.recordtype);
              console.log(updatedrecord);

           $pouchDB.get(updatedrecord.recordtype).then(function(response) {
              console.log("getting success");
              console.log(response);

              //udate record with new values

              response.sname = updatedrecord.sname;
              response.url = updatedrecord.url;
              response.name = updatedrecord.name;
              response.password = updatedrecord.password;

              console.log("before store data");
              console.log(response);

              //save the updated record
              storeData(response);

            }, function(error) {
                console.log("ERROR -> " + error);
            });


        }

        //remove the data
        $scope.removeItem = function(record) {

            console.log("removing data locally"+record.doc._id+record.doc._rev);


            $pouchDB.delete(record.doc._id,record.doc._rev).then(function(response) {
              console.log("removing success");

              //reloading database
              $scope.init();

            }, function(error) {
                console.log("ERROR -> " + error);
            });


        }

        //reset form to blank state
        var resetForm = function() {

            $scope.record.sname = '';
            $scope.record.url = '';
            $scope.record.name = '';
            $scope.record.password = '';
            $scope.record.recordtype = 'new';
            record = null;
        };
    });
