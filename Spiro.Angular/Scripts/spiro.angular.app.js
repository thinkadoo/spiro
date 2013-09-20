var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    (function (Angular) {
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

        var servicesPageTemplate = svrPath + 'Content/partials/servicesPage.html';
        var servicePageTemplate = svrPath + 'Content/partials/servicePage.html';
        var objectPageTemplate = svrPath + 'Content/partials/objectPage.html';
        var transientObjectPageTemplate = svrPath + 'Content/partials/transientObjectPage.html';

        /* Declare app level module */
        Angular.app = angular.module('app', ['ngResource']);

        Angular.app.config(function ($routeProvider) {
            $routeProvider.when('/services', {
                templateUrl: servicesPageTemplate,
                controller: 'BackgroundController'
            }).when('/services/:sid', {
                templateUrl: servicePageTemplate,
                controller: 'BackgroundController'
            }).when('/objects/:dt/:id', {
                templateUrl: objectPageTemplate,
                controller: 'BackgroundController'
            }).when('/objects/:dt', {
                templateUrl: transientObjectPageTemplate,
                controller: 'BackgroundController'
            }).otherwise({
                redirectTo: '/services'
            });
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.app.js.map
