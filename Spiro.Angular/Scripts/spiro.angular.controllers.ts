/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />

// tested 
module Spiro.Angular {

    declare var svrPath: string;

    app.controller('BackgroundController', function ($scope, $location : ng.ILocationService, Color : IColor, UrlHelper : IUrlHelper) {
        $scope.backgroundColor = Color.toColorFromHref($location.absUrl()); 


        $scope.closeNestedObject = UrlHelper.toAppUrl($location.path(), ["property", "collectionItem", "resultObject"]);
        $scope.closeCollection = UrlHelper.toAppUrl($location.path(), ["collection", "resultCollection"]);
    });

    app.controller('ServicesController', function ($scope : ng.IScope, Handlers: IHandlers) {
        Handlers.handleServices($scope);
    });

    app.controller('ServiceController', function ($scope: ng.IScope, Handlers: IHandlers) {
        Handlers.handleService($scope);
    });

    app.controller('DialogController', function ($scope: ng.IScope, $routeParams: ISpiroRouteParams, Handlers: IHandlers) {
        if ($routeParams.action) {
            Handlers.handleActionDialog($scope);
        }
    });

    app.controller('NestedObjectController', function ($scope: ng.IScope, $routeParams: ISpiroRouteParams, Handlers: IHandlers) {

        // action takes priority 
        if ($routeParams.action) {
            Handlers.handleActionResult($scope);
        }
        if ($routeParams.property) {
            Handlers.handleProperty($scope);
        }
        else if ($routeParams.collectionItem) {
            Handlers.handleCollectionItem($scope);
        }
        else if ($routeParams.resultObject) {
            Handlers.handleResult($scope);
        }
    });

    app.controller('CollectionController', function ($scope: ng.IScope, $routeParams: ISpiroRouteParams, Handlers: IHandlers) {
        if ($routeParams.resultCollection) {
            Handlers.handleCollectionResult($scope);
        }
        else if ($routeParams.collection) {
            Handlers.handleCollection($scope);
        }
    });

    app.controller('ObjectController', function ($scope: ng.IScope, $routeParams: ISpiroRouteParams, Handlers: IHandlers) {
        if ($routeParams.editMode) {
            Handlers.handleEditObject($scope);
        }
        else {
            Handlers.handleObject($scope);
        }
    });

    app.controller('ErrorController', function ($scope: ng.IScope, Handlers: IHandlers) {
        Handlers.handleError($scope);
    });

    app.controller('AppBarController', function ($scope: ng.IScope, Handlers: IHandlers) {
        Handlers.handleAppBar($scope);    
    });
}