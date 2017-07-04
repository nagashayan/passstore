 /* Login controller controller
  * for handling google drive login 
  * uses googledriveauth to store user info for entire session 
  */
 keepassApp.controller('loginController', function ($scope, $rootScope, $googledriveauth, $googledriveDB) {

     $scope.userSignedin = false;
     // Once the google library file loads in index.html this function will be called
     $scope.handleclient = function () {
         console.log("inside handle client");
         $googledriveauth.handleClientLoad();
     };

     // When authorize/sigin button is clicked
     $scope.signin = function () {
         console.log("signing you in");
         $googledriveauth.handleAuthClick();

     };

     // When signout button is clicked
     $scope.signout = function () {
         console.log("signing you out");
         $googledriveauth.handleSignoutClick();

     };

     // After user sign in is successful, broadcast msg from googledriveauth
     $scope.$on('signedIn', function (event) {
         console.log("After signedin");
         $scope.userSignedin = true;
         $scope.$apply();
     });

     // After user sign out is successful, broadcast msg from googledriveauth 
     $scope.$on('signedOut', function (event) {
         console.log("After signedout");
         $scope.userSignedin = false;
         $scope.$apply();
     });


 });