 /* DB controller controller
 * for handling pouchdb and google drive database CRUD operations 
 * uses pouchdbservice & googledriveDBservice to store user info for entire session 
 */
 keepassApp.controller('DBController', function ($scope, $rootScope, $pouchDB, $googledriveauth) {

      // After user sign in is successful, broadcast msg from googledriveauth
     $scope.$on('signedIn', function (event) {
         console.log("After signedin received in DBController");
         $scope.userSignedin = true;
         $scope.$apply();
     });

     // After user sign out is successful, broadcast msg from googledriveauth 
     $scope.$on('signedOut', function (event) {
         console.log("After signedout received in DBController");
         $scope.userSignedin = false;
         $scope.$apply();
     });

 });