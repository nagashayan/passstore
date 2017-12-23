 /* Login controller controller
  * for handling google drive login 
  * uses googledriveauth to store user info for entire session 
  */
 keepassApp.controller('loginController', function ($scope, $rootScope, $googledriveauth) {

     $scope.userSignedin = false;
     var logging = false;
     // Once the google library file loads in index.html this function will be called
     $scope.handleclient = function () {
         log("inside handle client");
         $googledriveauth.handleClientLoad();
     };

     // When authorize/sigin button is clicked
     $scope.signin = function () {
         log("signing you in");
         $googledriveauth.handleAuthClick();

     };

     // When signout button is clicked
     $scope.signout = function () {
         log("signing you out");
         $googledriveauth.handleSignoutClick();

     };

     // After user sign in is successful, broadcast msg from googledriveauth
     $scope.$on('signedIn', function (event) {
         log("After signedin");
         $scope.userSignedin = true;
         $scope.$apply();
     });

     // After user sign out is successful, broadcast msg from googledriveauth 
     $scope.$on('signedOut', function (event) {
         log("After signedout");
         $scope.userSignedin = false;
         $scope.$apply();
     });

     var log = function(data){
         if(logging == true){
             console.log(data);
         }
     };

 });