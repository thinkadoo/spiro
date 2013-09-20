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
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.app.js.map
