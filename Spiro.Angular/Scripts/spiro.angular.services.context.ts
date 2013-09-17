/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />


module Spiro.Angular {

    export interface IContext {
        getHome: () => ng.IPromise<HomePageRepresentation>;
        getServices: () => ng.IPromise<DomainServicesRepresentation>;
        getObject: (type: string, id?: string) => ng.IPromise<DomainObjectRepresentation>;
        setObject: (object: DomainObjectRepresentation) => void;
        getNestedObject: (type: string, id: string) => ng.IPromise<DomainObjectRepresentation>;
        setNestedObject: (object: DomainObjectRepresentation) => void;
        getCollection: () => ng.IPromise<ListRepresentation>;
        setCollection: (list: ListRepresentation) => void;
        getError: () => ErrorRepresentation;
        setError: (object: ErrorRepresentation) => void;
    }

    app.service('Context', function ($q : ng.IQService, RepLoader: IRepLoader) {

        var context = <IContext>this; 

        var currentHome: HomePageRepresentation = null;

        function isSameObject(object: DomainObjectRepresentation, type: string, id?: string) {
            var sid = object.serviceId();
            return sid ? sid === type : (object.domainType() == type && object.instanceId() === id);
        }

        // exposed for testing
        this.getDomainObject = function (type: string, id: string) {
            var object = new DomainObjectRepresentation();
            object.hateoasUrl = appPath + "/objects/" + type + "/" + id;
            return RepLoader.populate(object);
        };

        // exposed for testing
        this.getService = function (type: string) {
            var delay = $q.defer();

            this.getServices().
                then(function (services: DomainServicesRepresentation) {
                    var serviceLink = _.find(services.value().models, (model) => { return model.rel().parms[0] === 'serviceId="' + type + '"'; });
                    var service = serviceLink.getTarget();
                    return RepLoader.populate(service);
                }).
                then(function (service: DomainObjectRepresentation) {
                    currentObject = service;
                    delay.resolve(service);
                });
            return delay.promise;
        };


        context.getHome = function () {
            var delay = $q.defer();

            if (currentHome) {
                delay.resolve(currentHome);
            }
            else {
                var home = new HomePageRepresentation();
                RepLoader.populate(home).then(function (home: HomePageRepresentation) {
                    currentHome = home;
                    delay.resolve(home);
                });
            }

            return delay.promise;
        };

        var currentServices: DomainServicesRepresentation = null;

        context.getServices = function () {
            var delay = $q.defer();

            if (currentServices) {
                delay.resolve(currentServices);
            }
            else {
                this.getHome().
                    then(function (home: HomePageRepresentation) {
                        var ds = home.getDomainServices();
                        return RepLoader.populate(ds);
                    }).
                    then(function (services: DomainServicesRepresentation) {
                        currentServices = services;
                        delay.resolve(services);
                    });
            }

            return delay.promise;
        };

        var currentObject: DomainObjectRepresentation = null;

        context.getObject = function (type: string, id?: string) {
            var delay = $q.defer();

            if (currentObject && isSameObject(currentObject, type, id)) {
                delay.resolve(currentObject);
            }
            else {
                var promise = id ? this.getDomainObject(type, id) : this.getService(type);
                promise.
                    then(function (object: DomainObjectRepresentation) {
                        currentObject = object;
                        delay.resolve(object);
                    });
            }

            return delay.promise;
        };

        context.setObject = function (co) {
            currentObject = co;
        };

        var currentNestedObject: DomainObjectRepresentation = null;

        context.getNestedObject = function (type: string, id: string) {
            var delay = $q.defer();

            if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                delay.resolve(currentNestedObject);
            }
            else {
                var object = new DomainObjectRepresentation();
                object.hateoasUrl = appPath + "/objects/" + type + "/" + id;

                RepLoader.populate(object).
                    then(function (object: DomainObjectRepresentation) {
                        currentNestedObject = object;
                        delay.resolve(object);
                    });
            }

            return delay.promise;
        };

        context.setNestedObject = function (cno) {
            currentNestedObject = cno;
        };

        var currentError: ErrorRepresentation = null;

        context.getError = function () {
            return currentError;
        };

        context.setError = function (e: ErrorRepresentation) {
            currentError = e;
        };

        var currentCollection: ListRepresentation = null;

        context.getCollection = function () {
            var delay = $q.defer();
            delay.resolve(currentCollection);
            return delay.promise;
        };

        context.setCollection = function (c: ListRepresentation) {
            currentCollection = c;
        };

    });

}