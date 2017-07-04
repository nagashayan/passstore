//1. create app module
var keepassApp = angular.module('keepassApp', [])
    .run(function ($pouchDB) {
        $pouchDB.setDatabase("keepassxplus-db");
    });