/// <reference path="typings/angularjs/angular.d.ts" />

module Spiro.Angular {

    declare var svrPath: string;

    /* Declare app level module */
   
    export var app = angular.module('app', ['ngResource']);

    app.config(function ($routeProvider: ng.IRouteProvider) {
        $routeProvider.
            when('/services', {
                templateUrl: svrPath + 'Content/partials/servicesPage.html',
                controller: 'BackgroundController'
            }).
            when('/services/:sid', {
                templateUrl: svrPath + 'Content/partials/servicePage.html',
                controller: 'BackgroundController'
            }).
            when('/objects/:dt/:id', {
                templateUrl: svrPath + 'Content/partials/objectPage.html',
                controller: 'BackgroundController'
            }).
            otherwise({
                redirectTo: '/services'
            });
    });


    export interface ISpiroRouteParams extends ng.IRouteParamsService {
        action: string;
        property: string;
        collectionItem: string;
        resultObject: string; 
        resultCollection: string; 
        collection: string; 
        editMode: string; 
        dt: string; 
        id: string; 
        sid: string; 
    }
}