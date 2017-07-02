// Googledrive - angularjs service
keepassApp.service('$googledrive', ['$rootScope', function ($rootScope) {


    console.log("googldrive service started");

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
    var FILENAME = "keepassxfile";
    var fileId = null;
    var access_token = null;
    var fileURL = null;

    // Sends broadcast message to main controller to update UI
    function startUpdatingUI (){
        $rootScope.$broadcast('initialize', {});
        console.log('sent init');
    }
    /* Replace pouchdb data with google drive data
    */
    function UpdatePouchDB (){
        console.log('updating pouchdb using google drive data');
        startUpdatingUI();
    }
    /* If response url is valid then will read the file contents
     */
    function readGoogleDriveDB() {

        // Downloding data from this url
        console.log("downloading data from " + fileURL);
        $.ajax(fileURL, {
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            success: function (data) {

                console.log("got data" + JSON.stringify(data));
                // Create the file anyhow
                UpdatePouchDB();

            },
            error: function (xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
                startUpdatingUI();
            }
        });

    }
    // Check if google drive File exists
    function getGoogleDriveFile() {
        console.log('checking if google drive file exists');
        console.log("readin files");
        access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        console.log(access_token);
        var requestFile = gapi.client.drive.files.get({
            'fileId': fileId
        });

        requestFile.execute(function (readfileresponse) {
            if (readfileresponse.id) {
                fileURL = readfileresponse.downloadUrl;
                readGoogleDriveDB();
            }
            console.log("file doesn't exist");
            startUpdatingUI();
        });
    }


    // Initializes the app DB
    function initializeDB() {
        console.log('initializes db');
        getGoogleDriveFile();
        

    }
    /*
     * Function Initializes application data & sends init broadcast msg to maincontroller 
     * to kick off UI initializaton of the app
     */
    function startInitialization() {
        initializeDB();
        
    }

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    this.handleClientLoad = function () {
        console.log("inside handleclient in service");
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
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
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
            startInitialization();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            console.log('SOMETHING WRONG WITH SIGN IN');
        }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    function appendPre(message) {
        console.log("msg = " + message);
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }

    /**
     * Print files.
     */
    function listFiles(pouchdata) {
        console.log("list files");
        gapi.client.drive.files.list({
            'q': '\'appdata\' in parents',
            'maxResults': 10
        }).then(function (response) {
            console.log("Files:");
            appendPre('Files:');
            var files = response.result.items;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    appendPre(file.title + ' (' + file.id + ')');
                    if (file.title == FILENAME) {
                        fileId = file.id;
                        console.log("fileId" + fileId);
                        // readFile(pouchdata);
                        return;
                    }
                }
            } else {
                console.log("No files found");
                appendPre('No files found.');

                //create the file
                createFile(pouchdata);

            }
        });
    }


    /*
     * create and save the file
     */
    function updateGoogleDriveDB(pouchdata) {
        console.log("pouchdata");
        // Data to be stored 
        console.log(pouchdata);
        var metadata = {
            title: FILENAME,
            mimeType: 'application/json',
            parents: [{
                id: 'appdata'
            }]
        }
        // Remove this
        var filedata = {
            id: 1,
            name: 'naga'
        };
        console.log("sample data");
        console.log(filedata);
        data = new FormData();
        data.append("metadata", new Blob([JSON.stringify(metadata)], {
            type: "application/json"
        }));
        data.append("file", new Blob([JSON.stringify(pouchdata)], {
            type: "application/json"
        }));

        access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        console.log(access_token);
        var up = fileId != null ? '/' + fileId : '';
        $.ajax("https://www.googleapis.com/upload/drive/v2/files" + up + "?uploadType=multipart", {
            data: data,
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            contentType: false,
            processData: false,
            type: fileId != null ? 'PUT' : 'POST',
            success: function (data) {
                console.log("File written successfully");
                // Starts initialization on main controller
                //startInitialization();
            }
        });

    }

    function getFileURL() {
        console.log("readin files");
        access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        console.log(access_token);
        var requestFile = gapi.client.drive.files.get({
            'fileId': fileId
        });

        requestFile.execute(function (readfileresponse) {
            if (readfileresponse.id) {
                return readfileresponse;
            }

            return null;
        });
    }

    $rootScope.$on('saveToDrive', function (event, pouchdata) {
        console.log("received data to be stored");
        console.log(pouchdata);

        updateGoogleDriveDB(pouchdata);


    });


}]);