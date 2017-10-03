
//pouchdb - angularjs service
keepassApp.service("$pouchDB", ["$rootScope", "$q", function ($rootScope, $q) {

    var database;
    var changeListener;

    this.setDatabase = function (databaseName) {
        database = new PouchDB(databaseName);
        console.log("created new dataabase" + databaseName);
    };

    this.startListening = function () {
        console.log("created new dataabase");

        changeListener = database.changes({
            live: true,
            include_docs: true
        }).on("change", function (change) {
            if (!change.deleted) {
                $rootScope.$broadcast("$pouchDB:change", change);
            } else {
                $rootScope.$broadcast("$pouchDB:delete", change);
            }
        });
    };

    this.stopListening = function () {
        changeListener.cancel();
    };

    this.sync = function (remoteDatabase) {
        database.sync(remoteDatabase, {
            live: true,
            retry: true
        });
    };

    this.save = function (jsonDocument) {
        var deferred = $q.defer();
        if (!jsonDocument._id) {
            database.post(jsonDocument).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error);
            });
        } else {
            database.put(jsonDocument).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };

    this.delete = function (documentId, documentRevision) {
        console.log("removing data locally" + documentId + documentRevision);
        return database.remove(documentId, documentRevision);
    };

    this.get = function (documentId) {
        return database.get(documentId);
    };

    this.getAll = function () {

        var deferred = $q.defer();
        database.allDocs({
            include_docs: true,
            attachments: false
        }).then(function (result) {
            deferred.resolve(result);

        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    /*
    This function uses different function to get all docs
    */
    this.bulkGetAll = function () {

        var deferred = $q.defer();
        database.bulkGet().then(function (result) {
            console.log("inside bulk getall");
            console.log(result);
            deferred.resolve(result);

        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    this.putAll = function (docs) {

        var deferred = $q.defer();
        database.bulkDocs(docs).then(function (result) {
            deferred.resolve(result);

        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;

    };

    this.destroy = function () {
        database.destroy();
    };


    /*
    * Sets last updated time stamp of the complete database, we can use that to decide 
    * weather to sync with google drive or not
    */ 

    this.setLastUpdatedTimeStamp = function (lastUpdatedTimeStamp) {
        var deferred = $q.defer();
        console.log("setting last updated timestamp"+lastUpdatedTimeStamp);
        this.save({
        _id: 'last_updated',
        value: lastUpdatedTimeStamp
        }).then(function (response) {
        // handle response
        deferred.resolve(response);
        }).catch(function (err) {
         deferred.reject(err);
        });

        return deferred.promise;
        
    };

    this.getLastUpdatedTimeStamp = function (lastUpdatedTimeStamp) {
        console.log("geting pouchdb last updated time");
        var deferred = $q.defer();

        this.get('last_updated').then(function (response) {
        // handle response
        console.log("Response");
        console.log(response);
        deferred.resolve(response);
        }).catch(function (err) {
         deferred.reject(err);
        });

        return deferred.promise;
        
    };
    

}]);