// Googledrive - angularjs service
keepassApp.service('$googledriveDB', ['$rootScope', '$q', function ($rootScope, $q) {


    console.log("googldriveDB service started");

    var FILENAME = "keepassxfile";
    var fileId = null;
    var access_token = null;
    var fileURL = null;
    var filedownloadurl = null;
    var file_last_modified = null;
    var file_version = null;

    // Sends broadcast message to main controller to update UI
    function startUpdatingUI() {
        $rootScope.$broadcast('initialize', {});
        console.log('sent init');
    }
    /* Replace pouchdb data with google drive data
     */
    function UpdatePouchDB() {
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

    /**
     * Lists out all files and compares with our app file title
     * to find the match and sets global file ID
     */
    function setFileID() {
        // Create a new Deferred object
        var deferred = $.Deferred();
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
                   
                    if (file.title == FILENAME) {
                        fileId = file.id;
                        console.log("fileId" + fileId);
                        deferred.resolve();
                    }
                }
            } else {
                console.log("No files found");
                appendPre('No files found.');
                deferred.resolve();


            }
        });

        // Return the Deferred's Promise object
        return deferred.promise();
    }

    // Get Googledrive file URL
    function getGoogleDriveURL() {
        var requestFile = gapi.client.drive.files.get({
            'fileId': fileId
        });

        requestFile.execute(function (readfileresponse) {
            console.log("read file response" +
                JSON.stringify(readfileresponse));
            if (readfileresponse.id) {
                fileURL = readfileresponse.downloadUrl;
                readGoogleDriveDB();
            } else {
                console.log("file doesn't exist");
            }

            startUpdatingUI();
        });
    }

    // Check if google drive File exists
    function getGoogleDriveFile() {
        console.log('checking if google drive file exists');
        console.log("readin files");
        access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

        console.log(fileId); //fileId = null;//temporary 
        // If fileId is null then call list files to get file id by title
        if (fileId === null) {
            // If  fileId is not set then get fileId first
            setFileID().done(function () {
                console.log("function returned file id setting");
                // For first time fileId will be null so no need to read url if file id is null
                if (fileId !== null) {
                    getGoogleDriveURL();
                }
            });
        } else {
            // If already fileId is set then get URL
            getGoogleDriveURL();
        }
    }

    /*
     * create and save the file
     */
    function updateGoogleDriveDB(pouchdata) {
        console.log("updating pouchdata into file"+fileId);
        // Data to be stored 
        //console.log(pouchdata);
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
        console.log("up =="+up);
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

    /*
     * Check if google drive file exists by checking filenames
     */
    this.isGoogleDriveFileExists = function () {
        // Create a new Deferred object
        var deferred = $.Deferred();
        console.log("searching files");
        gapi.client.drive.files.list({
            'q': '\'appdata\' in parents',
            'maxResults': 10
        }).then(function (response) {
            console.log("Files:");
            var files = response.result.items;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log("file info"+file);
                    
                    for(attributes in file){
                        //console.log("attributes"+attributes);
                    }
                    console.log("last modified googledb="+file.modifiedDate+"last modified by me="+file.modifiedByMeDate+"file version"+file.version);
                    
                    //format date properly
                    file_last_modified = formatDate(file.modifiedDate);
                    console.log("modified date after formatting"+file_last_modified);
                    file_version = file.version;
                    
                    if (file.title === FILENAME) {
                        fileId = file.id;
                        console.log("fileId: " + fileId);
                        deferred.resolve(fileId);
                    }
                }
            } else {
                console.log("No files found");
                deferred.resolve(fileId);
            }
        });

        // Return the Deferred's Promise object
        return deferred.promise();
    }

    /**
     * Returns fileId
     */
    this.getFileId = function () {
        return fileId;
    }

    /**
     *  Saves the data to google drive db
     */
    this.saveToDrive = function(pouchdata){
        updateGoogleDriveDB(pouchdata);
    }

    this.getLastUpdatedTimeStamp = function () {
        console.log("resolving date"+file_last_modified);
        var deferred = $q.defer();
        deferred.resolve(file_last_modified);
        return deferred.promise;
    };

    var formatDate = function(modifieddate){
        console.log("modifying date");
        var date = modifieddate.substr(0,10);
        var time = modifieddate.substr(11,8);
        console.log(time);
        return date+ " "+time;
    }

}]);