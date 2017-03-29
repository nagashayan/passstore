
    //main controller controller
    keepassApp.controller("keepassController", function($scope, $rootScope, $http, $pouchDB) {

        $scope.myTxt = "You have not yet clicked submit";

        //set record object properties
        $scope.record = {

            sname: null,
            url: null,
            name: null,
            password: null

        };


        $scope.data = [];

        //start pouchdb service
        $pouchDB.startListening();

        $scope.init = function(){
         //init state of a system
        console.log("init state");
          //get all database records and push into list output

          $pouchDB.getAll().then(function(response) {
            console.log("getting success");
            console.log(response.rows);
            $scope.data.push(response.rows);
            console.log($scope.data[0]);

           // $scope.data.push(JSON.stringify(response.rows));
          }, function(error) {
              console.log("ERROR -> " + error);
          });


        }
        angular.element(document).ready(function () {
         $scope.init();
   });


       // $scope.init();



        //5. create submitkeepassForm() function. This will be called when user submits the form
        $scope.submitkeepassForm = function() {

            $scope.myTxt = "You clicked submit!";

            //saving the record
            if ($scope.record.name) {
                console.log("keepass record saved" + $scope.record.name);
                console.log("keepass record saved" + $scope.record.url);
                var record = {
                    sname: $scope.record.sname,
                    url: $scope.record.url,
                    name: $scope.record.name,
                    password: $scope.record.password
                };

                $scope.data.push(record);

                //store the record locally
                storeData(record);

                //reset form
                $scope.record.sname = '';
                $scope.record.url = '';
                $scope.record.name = '';
                $scope.record.password = '';
                record = null;
            }

        };

        //frame the variable and return

        $scope.initvar = function(index) {

            console.log("initing");

            return "show_"+index+" =  true";

        }


        //store the data
        var storeData = function(record) {
            console.log("storing data locally");


            $pouchDB.save(record).then(function(response) {
              console.log("saving success");
            }, function(error) {
                console.log("ERROR -> " + error);
            });

        }

        //remove the data
        $scope.removeItem = function(record) {

            console.log("removing data locally"+record.doc._id+record.doc._rev);

            /*
            $pouchDB.delete(record.doc._id,record.doc._rev).then(function(response) {
              console.log("removing success");

            }, function(error) {
                console.log("ERROR -> " + error);
            });
            */

        }

        //6. create resetForm() function. This will be called on Reset button click.
        $scope.resetForm = function() {
            $scope.keepass = angular.copy($scope.Originalkeepass);
        };
    });
