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
            when('/objects/:dt', {
                templateUrl: svrPath + 'Content/partials/transientObjectPage.html',
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

    // templates 
    export var nestedCollectionTemplate = svrPath + "Content/partials/nestedCollection.html";    
    export var nestedObjectTemplate = svrPath + "Content/partials/nestedObject.html";   
    export var dialogTemplate = svrPath + "Content/partials/dialog.html";
    export var servicesTemplate = svrPath + "Content/partials/services.html";
    export var serviceTemplate = svrPath + "Content/partials/service.html";
    export var actionTemplate = svrPath + "Content/partials/actions.html";
    export var errorTemplate = svrPath + "Content/partials/error.html";
    export var appBarTemplate = svrPath + "Content/partials/appbar.html";
    export var objectTemplate = svrPath + "Content/partials/object.html";
    export var viewPropertiesTemplate = svrPath + "Content/partials/viewProperties.html";
    export var editPropertiesTemplate = svrPath + "Content/partials/editProperties.html";

}