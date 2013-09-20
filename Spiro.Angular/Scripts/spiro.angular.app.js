var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    (function (Angular) {
        /* Declare app level module */
        Angular.app = angular.module('app', ['ngResource']);

        Angular.app.config(function ($routeProvider) {
            $routeProvider.when('/services', {
                templateUrl: svrPath + 'Content/partials/servicesPage.html',
                controller: 'BackgroundController'
            }).when('/services/:sid', {
                templateUrl: svrPath + 'Content/partials/servicePage.html',
                controller: 'BackgroundController'
            }).when('/objects/:dt/:id', {
                templateUrl: svrPath + 'Content/partials/objectPage.html',
                controller: 'BackgroundController'
            }).when('/objects/:dt', {
                templateUrl: svrPath + 'Content/partials/transientObjectPage.html',
                controller: 'BackgroundController'
            }).otherwise({
                redirectTo: '/services'
            });
        });

        // templates
        Angular.nestedCollectionTemplate = svrPath + "Content/partials/nestedCollection.html";
        Angular.nestedObjectTemplate = svrPath + "Content/partials/nestedObject.html";
        Angular.dialogTemplate = svrPath + "Content/partials/dialog.html";
        Angular.servicesTemplate = svrPath + "Content/partials/services.html";
        Angular.serviceTemplate = svrPath + "Content/partials/service.html";
        Angular.actionTemplate = svrPath + "Content/partials/actions.html";
        Angular.errorTemplate = svrPath + "Content/partials/error.html";
        Angular.appBarTemplate = svrPath + "Content/partials/appbar.html";
        Angular.objectTemplate = svrPath + "Content/partials/object.html";
        Angular.viewPropertiesTemplate = svrPath + "Content/partials/viewProperties.html";
        Angular.editPropertiesTemplate = svrPath + "Content/partials/editProperties.html";
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.app.js.map
