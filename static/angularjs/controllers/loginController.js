 //main controller controller
 keepassApp.controller('loginController', function ($scope, $rootScope, $http, $pouchDB, $filter, $googledriveauthservice) {

     // Once the google library file loads in index.html this function will be called
     $scope.handleclient = function () {
         console.log("inside handle client");
         $googledriveauthservice.handleClientLoad();
     }

     // When authorize/sigin button is clicked
     $scope.signin = function (){
         console.log("signing you in");
         $googledriveauthservice.handleAuthClick();
         
     }

     // When signout button is clicked
     $scope.signout = function (){
         console.log("signing you out");
         $googledriveauthservice.handleSignoutClick();
         
     }


 });