//our custom js files
console.log("location = "+window.location.origin);
window.location.origin = "http://keepassxplus.com";
console.log("location = "+window.location.origin);

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

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

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
    listFiles();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
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
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print files.
 */
function listFiles() {
 console.log("list files");
  gapi.client.drive.files.list({
    'q': '\'appdata\' in parents',
    'maxResults': 10
  }).then(function(response) {
    appendPre('Files:');
    var files = response.result.items;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        appendPre(file.title + ' (' + file.id + ')');
        if(file.title == FILENAME) {
          fileId = file.id;
          console.log("fileId"+fileId);
          readFile();
          return;
        }
      }
    } else {
      appendPre('No files found.');

      //create the file
      createFile();

    }
  });
}

/*
* create and save the file
*/
function createFile(){
  var metadata = {
    title: FILENAME,
    mimeType: 'application/json',
    parents: [{id: 'appdata'}]
  }
  var filedata = {id: 1, name: 'naga'};
  data = new FormData();
  data.append("metadata", new Blob([ JSON.stringify(metadata) ], { type: "application/json" }));
  data.append("file", new Blob([ JSON.stringify(filedata) ], { type: "application/json" }));

  var token = gapi.auth.getToken();
  console.log("token"+token.access_token);
  var up = fileId != null ? '/' + fileId : '';
  $.ajax("https://www.googleapis.com/upload/drive/v2/files" + up + "?uploadType=multipart", {
    data: data,
    headers: {Authorization: 'Bearer ' + token.access_token},
    contentType: false,
    processData: false,
    type: fileId != null ? 'PUT' : 'POST',
    success: function(data) {
      console.log("File written");
    }
  });

 }

 function readFile(){
  var token = gapi.auth.getToken();
  var request = gapi.client.drive.files.get({
     'fileId': fileId
   });
   request.execute(function(resp) {
     if (resp.id) {
       var token = gapi.auth.getToken();
       $.ajax(resp.downloadUrl, {
         headers: {Authorization: 'Bearer ' + token.access_token},
         success: function(data) {

           console.log("got data"+JSON.stringify(data));
           //stateToForm();
         }
       });
     }
   });
 }
