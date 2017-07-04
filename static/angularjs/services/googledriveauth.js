// Googledrive - angularjs service
keepassApp.service('$googledriveauth', ['$rootScope', function ($rootScope) {


    console.log("googldrive auth service started");

    //run all basic authentications here
    // Client ID and API key from the Developer Console
    var CLIENT_ID = '168029050025-kquglj6b9ecjnn00tqtp1v7ut29iocis.apps.googleusercontent.com';

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');
    var access_token = null;

    // Sends broadcast message to main controller to update UI
    function startUpdatingUI() {
        $rootScope.$broadcast('initialize', {});
        console.log('sent init');
    }
    
    /**
     *  On load, called to load the auth2 library and API client library.
     */
    this.handleClientLoad = function () {
        gapi.load('client:auth2', initClient);
    };

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
        gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
     
        });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            $rootScope.$broadcast('signedIn', {});
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            $rootScope.$broadcast('signedOut', {});
        }
    }

    /**
     *  Sign in the user upon button click.
     */
    this.handleAuthClick = function () {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    this.handleSignoutClick = function () {
        gapi.auth2.getAuthInstance().signOut();
    }
}]);