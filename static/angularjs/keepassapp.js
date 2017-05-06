//1. create app module
var keepassApp = angular.module('keepassApp', [])
    .run(function($pouchDB) {
        $pouchDB.setDatabase("keepassxplus-db");
    });


//pouchdb - angularjs service
keepassApp.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

    var database;
    var changeListener;

    this.setDatabase = function(databaseName) {
        database = new PouchDB(databaseName);
        console.log("created new dataabase"+databaseName);
    }

    this.startListening = function() {
        console.log("created new dataabase");

        changeListener = database.changes({
            live: true,
            include_docs: true
        }).on("change", function(change) {
            if (!change.deleted) {
                $rootScope.$broadcast("$pouchDB:change", change);
            } else {
                $rootScope.$broadcast("$pouchDB:delete", change);
            }
        });
    }

    this.stopListening = function() {
        changeListener.cancel();
    }

    this.sync = function(remoteDatabase) {
        database.sync(remoteDatabase, {
            live: true,
            retry: true
        });
    }

    this.save = function(jsonDocument) {
        var deferred = $q.defer();
        if (!jsonDocument._id) {
            database.post(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        } else {
            database.put(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    }

    this.delete = function(documentId, documentRevision) {
         console.log("removing data locally"+documentId+documentRevision);
        return database.remove(documentId, documentRevision);
    }

    this.get = function(documentId) {
        return database.get(documentId);
    }

    this.getAll = function() {

      var deferred = $q.defer();
      database.allDocs({
        include_docs: true,
        attachments: true
      }).then(function (result) {
          deferred.resolve(result);

      }).catch(function(error) {
          deferred.reject(error);
      });
      return deferred.promise;
    }

    this.destroy = function() {
        database.destroy();
    }

}]);
