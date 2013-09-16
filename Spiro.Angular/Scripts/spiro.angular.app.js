var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="typings/underscore/underscore.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    (function (Angular) {
        /* Declare app level module */
        Angular.app = angular.module('app', ['ngResource']);

        Angular.app.config(function ($routeProvider) {
            $routeProvider.when('/services', {
                templateUrl: svrPath + 'Content/partials/services.html',
                controller: 'ServicesController'
            }).when('/services/:sid', {
                templateUrl: svrPath + 'Content/partials/service.html',
                controller: 'ServiceController'
            }).when('/objects/:dt/:id', {
                templateUrl: svrPath + 'Content/partials/object.html',
                controller: 'ObjectController'
            }).otherwise({
                redirectTo: '/services'
            });
        });

        Angular.app.service('UrlHelper', function ($routeParams) {
            var helper = this;

            helper.action = function (dvm) {
                var pps = dvm && dvm.parameters.length > 0 ? _.reduce(dvm.parameters, function (memo, parm) {
                    return memo + "/" + parm.getValue().toString();
                }, "") : "";

                return _.first($routeParams.action.split("/")) + encodeURIComponent(pps);
            };

            helper.actionParms = function () {
                return _.rest($routeParams.action.split("/"));
            };

            helper.getOtherParms = function (excepts) {
                function include(parm) {
                    return $routeParams[parm] && !_.any(excepts, function (except) {
                        return parm === except;
                    });
                }

                function getParm(name) {
                    return include(name) ? "&" + name + "=" + $routeParams[name] : "";
                }

                var actionParm = include("action") ? "&action=" + helper.action() : "";
                var collectionParm = include("collection") ? "&collection=" + $routeParams.collection : "";
                var collectionItemParm = include("collectionItem") ? "&collectionItem=" + $routeParams.collectionItem : "";
                var propertyParm = include("property") ? "&property=" + $routeParams.property : "";
                var resultObjectParm = include("resultObject") ? "&resultObject=" + $routeParams.resultObject : "";
                var resultCollectionParm = include("resultCollection") ? "&resultCollection=" + $routeParams.resultCollection : "";

                return actionParm + collectionParm + collectionItemParm + propertyParm + resultObjectParm + resultCollectionParm;
            };

            helper.toAppUrl = function (href, toClose) {
                var urlRegex = /(objects|services)\/(.*)/;
                var results = (urlRegex).exec(href);
                var parms = "";

                if (toClose) {
                    parms = helper.getOtherParms(toClose);
                    parms = parms ? "?" + parms.substr(1) : "";
                }

                return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] + parms : "";
            };

            helper.toActionUrl = function (href) {
                var urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.]+)?)\/actions\/([\w|\.]+)/;
                var results = (urlRegex).exec(href);
                return (results && results.length > 3) ? "#/" + results[1] + "/" + results[2] + "?action=" + results[4] + helper.getOtherParms(["action"]) : "";
            };

            helper.toPropertyUrl = function (href) {
                var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(properties)\/([\w|\.]+)/;
                var results = (urlRegex).exec(href);
                return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?property=" + results[5] + helper.getOtherParms(["property", "collectionItem", "resultObject"]) : "";
            };

            helper.toCollectionUrl = function (href) {
                var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(collections)\/([\w|\.]+)/;
                var results = (urlRegex).exec(href);
                return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collection=" + results[5] + helper.getOtherParms(["collection", "resultCollection"]) : "";
            };

            helper.toItemUrl = function (href, itemHref) {
                var parentUrlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)/;
                var itemUrlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)/;
                var parentResults = (parentUrlRegex).exec(href);
                var itemResults = (itemUrlRegex).exec(itemHref);
                return (parentResults && parentResults.length > 2) ? "#/" + parentResults[1] + "/" + parentResults[2] + "?collectionItem=" + itemResults[2] + "/" + itemResults[3] + helper.getOtherParms(["property", "collectionItem", "resultObject"]) : "";
            };
        });

        Angular.app.service('ViewModelFactory', function ($routeParams, $location, $q, $controller, UrlHelper, RepresentationLoader) {
            var viewModelFactory = this;

            viewModelFactory.errorViewModel = function (errorRep) {
                var errorViewModel = new Angular.ErrorViewModel();
                errorViewModel.message = errorRep.message() || "An Error occurred";
                var stackTrace = errorRep.stacktrace();

                errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace;
                return errorViewModel;
            };

            viewModelFactory.linkViewModel = function (linkRep) {
                var linkViewModel = new Angular.LinkViewModel();
                linkViewModel.title = linkRep.title();
                linkViewModel.href = UrlHelper.toAppUrl(linkRep.href());
                linkViewModel.color = Spiro.Angular.toColorFromHref(linkRep.href());
                return linkViewModel;
            };

            viewModelFactory.itemViewModel = function (linkRep, parentHref, index) {
                var linkViewModel = new Angular.LinkViewModel();
                linkViewModel.title = linkRep.title();
                linkViewModel.href = UrlHelper.toItemUrl(parentHref, linkRep.href());
                linkViewModel.color = Spiro.Angular.toColorFromHref(linkRep.href());
                return linkViewModel;
            };

            viewModelFactory.parameterViewModel = function (parmRep, id, previousValue) {
                var parmViewModel = new Angular.ParameterViewModel();

                parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";

                parmViewModel.title = parmRep.extensions().friendlyName;
                parmViewModel.dflt = parmRep.default().toValueString();
                parmViewModel.message = "";
                parmViewModel.value = previousValue;
                parmViewModel.id = id;
                parmViewModel.format = parmRep.extensions().format;

                parmViewModel.reference = "";

                parmViewModel.choices = _.map(parmRep.choices(), function (v) {
                    return Angular.ChoiceViewModel.create(v);
                });

                parmViewModel.hasChoices = parmViewModel.choices.length > 0;

                if (parmViewModel.hasChoices && previousValue) {
                    parmViewModel.choice = _.find(parmViewModel.choices, function (c) {
                        return c.name == previousValue;
                    });
                }

                parmViewModel.autoComplete = function () {
                    var object = new Spiro.DomainObjectRepresentation();

                    object.hateoasUrl = appPath + "/objects/" + parmRep.extensions().returnType + "/" + parmViewModel.search;

                    RepresentationLoader.populate(object).then(function (d) {
                        var l = d.selfLink();
                        l.set("title", d.title());
                        var v = new Spiro.Value(l);

                        var cvm = Angular.ChoiceViewModel.create(v);

                        parmViewModel.choice = cvm;
                        parmViewModel.choices = [cvm];
                    }, function () {
                        // not found
                        parmViewModel.choice = null;
                        parmViewModel.choices = [];
                    });
                };

                return parmViewModel;
            };

            viewModelFactory.actionViewModel = function (actionRep) {
                var actionViewModel = new Angular.ActionViewModel();
                actionViewModel.title = actionRep.extensions().friendlyName;
                actionViewModel.href = UrlHelper.toActionUrl(actionRep.detailsLink().href());
                return actionViewModel;
            };

            viewModelFactory.dialogViewModel = function (actionRep, invoke) {
                var dialogViewModel = new Angular.DialogViewModel();
                var parameters = actionRep.parameters();
                var parms = UrlHelper.actionParms();

                dialogViewModel.title = actionRep.extensions().friendlyName;
                dialogViewModel.isQuery = actionRep.invokeLink().method() === "GET";

                dialogViewModel.message = "";

                dialogViewModel.close = UrlHelper.toAppUrl(actionRep.upLink().href(), ["action"]);

                var i = 0;
                dialogViewModel.parameters = _.map(parameters, function (parm, id) {
                    return viewModelFactory.parameterViewModel(parm, id, parms[i++]);
                });

                dialogViewModel.doShow = function () {
                    return invoke(dialogViewModel, true);
                };
                dialogViewModel.doInvoke = function () {
                    return invoke(dialogViewModel, false);
                };

                return dialogViewModel;
            };

            viewModelFactory.propertyViewModel = function (propertyRep, id, propertyDetails) {
                var propertyViewModel = new Angular.PropertyViewModel();
                propertyViewModel.title = propertyRep.extensions().friendlyName;
                propertyViewModel.value = propertyRep.value().toString();
                propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
                propertyViewModel.returnType = propertyRep.extensions().returnType;
                propertyViewModel.format = propertyRep.extensions().format;
                propertyViewModel.href = propertyRep.isScalar() ? "" : UrlHelper.toPropertyUrl(propertyRep.detailsLink().href());
                propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : UrlHelper.toAppUrl(propertyRep.value().link().href());
                propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

                propertyViewModel.color = Spiro.Angular.toColorFromType(propertyRep.extensions().returnType);
                propertyViewModel.id = id;
                propertyViewModel.isEditable = !propertyRep.disabledReason();

                if (propertyDetails) {
                    propertyViewModel.choices = _.map(propertyDetails.choices(), function (v) {
                        return Angular.ChoiceViewModel.create(v);
                    });
                    propertyViewModel.hasChoices = propertyViewModel.choices.length > 0;
                }

                return propertyViewModel;
            };

            function create(collectionRep, UrlHelper) {
                var collectionViewModel = new Angular.CollectionViewModel();

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = collectionRep.size();
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.detailsLink().href());
                collectionViewModel.color = Spiro.Angular.toColorFromType(collectionRep.extensions().elementType);

                collectionViewModel.items = [];

                return collectionViewModel;
            }

            function createFromDetails(collectionRep, UrlHelper) {
                var collectionViewModel = new Angular.CollectionViewModel();
                var links = collectionRep.value().models;

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.selfLink().href());
                collectionViewModel.color = Spiro.Angular.toColorFromType(collectionRep.extensions().elementType);

                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return viewModelFactory.itemViewModel(link, collectionViewModel.href, i++);
                });

                return collectionViewModel;
            }

            function createFromList(listRep, UrlHelper, $location) {
                var collectionViewModel = new Angular.CollectionViewModel();
                var links = listRep.value().models;

                //collectionViewModel.title = listRep.extensions().friendlyName;
                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = "Objects";

                //collectionViewModel.href = toCollectionUrl(collectionRep.selfLink().href(), $routeParams);
                //collectionViewModel.color = toColorFromType(listRep.extensions().elementType);
                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return viewModelFactory.itemViewModel(link, $location.path(), i++);
                });

                return collectionViewModel;
            }

            viewModelFactory.collectionViewModel = function (collection) {
                if (collection instanceof Spiro.CollectionMember) {
                    return create(collection, UrlHelper);
                }
                if (collection instanceof Spiro.CollectionRepresentation) {
                    return createFromDetails(collection, UrlHelper);
                }
                if (collection instanceof Spiro.ListRepresentation) {
                    return createFromList(collection, UrlHelper, $location);
                }
                return null;
            };

            viewModelFactory.servicesViewModel = function (servicesRep) {
                var servicesViewModel = new Angular.ServicesViewModel();
                var links = servicesRep.value().models;
                servicesViewModel.title = "Services";
                servicesViewModel.color = "bg-color-darkBlue";
                servicesViewModel.items = _.map(links, function (link) {
                    return viewModelFactory.linkViewModel(link);
                });
                return servicesViewModel;
            };

            viewModelFactory.serviceViewModel = function (serviceRep) {
                var serviceViewModel = new Angular.ServiceViewModel();
                var actions = serviceRep.actionMembers();
                serviceViewModel.serviceId = serviceRep.serviceId();
                serviceViewModel.title = serviceRep.title();
                serviceViewModel.actions = _.map(actions, function (action) {
                    return viewModelFactory.actionViewModel(action);
                });
                serviceViewModel.color = Spiro.Angular.toColorFromType(serviceRep.serviceId());
                serviceViewModel.href = UrlHelper.toAppUrl(serviceRep.getUrl());
                serviceViewModel.closeNestedObject = UrlHelper.toAppUrl(serviceRep.getUrl(), ["property", "collectionItem", "resultObject"]);
                serviceViewModel.closeCollection = UrlHelper.toAppUrl(serviceRep.getUrl(), ["collection", "resultCollection"]);

                return serviceViewModel;
            };

            viewModelFactory.domainObjectViewModel = function (objectRep, details, save) {
                var objectViewModel = new Angular.DomainObjectViewModel();

                objectViewModel.href = UrlHelper.toAppUrl(objectRep.getUrl());

                objectViewModel.closeNestedObject = UrlHelper.toAppUrl(objectRep.getUrl(), ["property", "collectionItem", "resultObject"]);
                objectViewModel.closeCollection = UrlHelper.toAppUrl(objectRep.getUrl(), ["collection", "resultCollection"]);

                objectViewModel.cancelEdit = UrlHelper.toAppUrl(objectRep.getUrl());

                objectViewModel.color = Spiro.Angular.toColorFromType(objectRep.domainType());

                objectViewModel.doSave = save ? function () {
                    return save(objectViewModel);
                } : function () {
                };

                var properties = objectRep.propertyMembers();
                var collections = objectRep.collectionMembers();
                var actions = objectRep.actionMembers();

                objectViewModel.domainType = objectRep.domainType();
                objectViewModel.title = objectRep.title();

                objectViewModel.message = "";

                objectViewModel.properties = _.map(properties, function (property, id) {
                    return viewModelFactory.propertyViewModel(property, id, _.find(details, function (d) {
                        return d.instanceId() === id;
                    }));
                });
                objectViewModel.collections = _.map(collections, function (collection) {
                    return viewModelFactory.collectionViewModel(collection);
                });
                objectViewModel.actions = _.map(actions, function (action) {
                    return viewModelFactory.actionViewModel(action);
                });

                return objectViewModel;
            };
        });

        // TODO investigate using transformations to transform results
        Angular.app.service("RepresentationLoader", function ($http, $q) {
            function getUrl(model) {
                var url = model.url();

                if (model.method === "GET" || model.method === "DELETE") {
                    var asJson = _.clone((model).attributes);

                    if (_.toArray(asJson).length > 0) {
                        var map = JSON.stringify(asJson);
                        var encodedMap = encodeURI(map);
                        url += "?" + encodedMap;
                    }
                }

                return url;
            }

            function getData(model) {
                var data = {};

                if (model.method === "POST" || model.method === "PUT") {
                    data = _.clone((model).attributes);
                }

                return data;
            }

            this.populate = function (model, ignoreCache, expected) {
                var response = expected || model;
                var useCache = !ignoreCache;

                var delay = $q.defer();

                var config = {
                    url: getUrl(model),
                    method: model.method,
                    cache: useCache,
                    data: getData(model)
                };

                $http(config).success(function (data, status, headers, config) {
                    (response).attributes = data;
                    delay.resolve(response);
                }).error(function (data, status, headers, config) {
                    if (status === 500) {
                        var error = new Spiro.ErrorRepresentation(data);
                        delay.reject(error);
                    } else if (status === 400 || status === 422) {
                        var errorMap = new Spiro.ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    } else {
                        delay.reject(headers().warning);
                    }
                });

                return delay.promise;
            };
        });

        Angular.app.service('Context', function ($q, RepresentationLoader) {
            var currentHome = null;

            function isSameObject(object, type, id) {
                var sid = object.serviceId();
                return sid ? sid === type : (object.domainType() == type && object.instanceId() === id);
            }

            this.getDomainObject = function (type, id) {
                var object = new Spiro.DomainObjectRepresentation();
                object.hateoasUrl = appPath + "/objects/" + type + "/" + id;
                return RepresentationLoader.populate(object);
            };

            this.getService = function (type) {
                var delay = $q.defer();

                this.getServices().then(function (services) {
                    var serviceLink = _.find(services.value().models, function (model) {
                        return model.rel().parms[0] === 'serviceId="' + type + '"';
                    });
                    var service = serviceLink.getTarget();
                    return RepresentationLoader.populate(service);
                }).then(function (service) {
                    currentObject = service;
                    delay.resolve(service);
                });
                return delay.promise;
            };

            this.getHome = function () {
                var delay = $q.defer();

                if (currentHome) {
                    delay.resolve(currentHome);
                } else {
                    var home = new Spiro.HomePageRepresentation();
                    RepresentationLoader.populate(home).then(function (home) {
                        currentHome = home;
                        delay.resolve(home);
                    });
                }

                return delay.promise;
            };

            var currentServices = null;

            this.getServices = function () {
                var delay = $q.defer();

                if (currentServices) {
                    delay.resolve(currentServices);
                } else {
                    this.getHome().then(function (home) {
                        var ds = home.getDomainServices();
                        return RepresentationLoader.populate(ds);
                    }).then(function (services) {
                        currentServices = services;
                        delay.resolve(services);
                    });
                }

                return delay.promise;
            };

            var currentObject = null;

            this.getObject = function (type, id) {
                var delay = $q.defer();

                if (currentObject && isSameObject(currentObject, type, id)) {
                    delay.resolve(currentObject);
                } else {
                    var promise = id ? this.getDomainObject(type, id) : this.getService(type);
                    promise.then(function (object) {
                        currentObject = object;
                        delay.resolve(object);
                    });
                }

                return delay.promise;
            };

            this.setObject = function (co) {
                currentObject = co;
            };

            var currentNestedObject = null;

            this.getNestedObject = function (type, id) {
                var delay = $q.defer();

                if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                    delay.resolve(currentNestedObject);
                } else {
                    var object = new Spiro.DomainObjectRepresentation();
                    object.hateoasUrl = appPath + "/objects/" + type + "/" + id;

                    RepresentationLoader.populate(object).then(function (object) {
                        currentNestedObject = object;
                        delay.resolve(object);
                    });
                }

                return delay.promise;
            };

            this.setNestedObject = function (cno) {
                currentNestedObject = cno;
            };

            var currentError = null;

            this.getError = function () {
                return currentError;
            };

            this.setError = function (e) {
                currentError = e;
            };

            var currentCollection = null;

            this.getCollection = function () {
                var delay = $q.defer();
                delay.resolve(currentCollection);
                return delay.promise;
            };

            this.setCollection = function (c) {
                currentCollection = c;
            };
        });

        // TODO rename
        Angular.app.service("Handlers", function ($routeParams, $location, $q, $cacheFactory, RepresentationLoader, Context, ViewModelFactory, UrlHelper) {
            var handlers = this;

            // tested
            this.handleCollectionResult = function ($scope) {
                Context.getCollection().then(function (list) {
                    $scope.collection = ViewModelFactory.collectionViewModel(list);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleCollection = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                    return RepresentationLoader.populate(collectionDetails);
                }).then(function (details) {
                    $scope.collection = ViewModelFactory.collectionViewModel(details);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleActionDialog = function ($scope) {
                Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                    var actionTarget = object.actionMember(UrlHelper.action()).getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).then(function (action) {
                    if (action.extensions().hasParams) {
                        $scope.dialogTemplate = svrPath + "Content/partials/dialog.html";
                        $scope.dialog = ViewModelFactory.dialogViewModel(action, _.partial(handlers.invokeAction, $scope, action));
                    }
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleActionResult = function ($scope) {
                Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                    var action = object.actionMember(UrlHelper.action());

                    if (action.extensions().hasParams) {
                        var delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var actionTarget = action.getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).then(function (action) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }).then(function (result) {
                    handlers.setResult(result);
                }, function (error) {
                    if (error) {
                        setError(error);
                    }
                    // otherwise just action with parms
                });
            };

            // tested
            this.handleProperty = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    var propertyDetails = object.propertyMember($routeParams.property).getDetails();
                    return RepresentationLoader.populate(propertyDetails);
                }).then(function (details) {
                    var target = details.value().link().getTarget();
                    return RepresentationLoader.populate(target);
                }).then(function (object) {
                    setNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
            };

            //tested
            this.handleCollectionItem = function ($scope) {
                var collectionItemTypeKey = $routeParams.collectionItem.split("/");
                var collectionItemType = collectionItemTypeKey[0];
                var collectionItemKey = collectionItemTypeKey[1];

                Context.getNestedObject(collectionItemType, collectionItemKey).then(function (object) {
                    setNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleServices = function ($scope) {
                Context.getServices().then(function (services) {
                    $scope.services = ViewModelFactory.servicesViewModel(services);
                    Context.setObject(null);
                    Context.setNestedObject(null);
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleService = function ($scope) {
                Context.getObject($routeParams.sid).then(function (service) {
                    $scope.object = ViewModelFactory.serviceViewModel(service);
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleResult = function ($scope) {
                var result = $routeParams.resultObject.split("-");
                var dt = result[0];
                var id = result[1];

                Context.getNestedObject(dt, id).then(function (object) {
                    $scope.result = ViewModelFactory.domainObjectViewModel(object);
                    $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleError = function ($scope) {
                var error = Context.getError();
                if (error) {
                    var evm = ViewModelFactory.errorViewModel(error);
                    $scope.error = evm;
                    $scope.errorTemplate = svrPath + "Content/partials/error.html";
                }
            };

            // tested
            this.handleAppBar = function ($scope) {
                $scope.appBar = {};

                $scope.appBar.template = svrPath + "Content/partials/appbar.html";

                $scope.appBar.goHome = "#/";

                $scope.appBar.goBack = function () {
                    parent.history.back();
                };

                $scope.appBar.goForward = function () {
                    parent.history.forward();
                };

                $scope.appBar.hideEdit = true;

                if ($routeParams.dt && $routeParams.id) {
                    Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                        $scope.appBar.hideEdit = !(object) || $routeParams.editMode || false;

                        // rework to use viewmodel code
                        $scope.appBar.doEdit = "#" + $location.path() + "?editMode=true";
                    });
                }
            };

            //tested
            this.handleObject = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    Context.setNestedObject(null);
                    $scope.actionTemplate = svrPath + "Content/partials/actions.html";
                    $scope.propertiesTemplate = svrPath + "Content/partials/viewProperties.html";

                    $scope.object = ViewModelFactory.domainObjectViewModel(object);
                }, function (error) {
                    setError(error);
                });
            };

            // tested
            this.handleEditObject = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    var detailPromises = _.map(object.propertyMembers(), function (pm) {
                        return RepresentationLoader.populate(pm.getDetails());
                    });

                    $q.all(detailPromises).then(function (details) {
                        Context.setNestedObject(null);
                        $scope.actionTemplate = "";
                        $scope.propertiesTemplate = svrPath + "Content/partials/editProperties.html";

                        $scope.object = ViewModelFactory.domainObjectViewModel(object, details, _.partial(handlers.updateObject, $scope, object));
                    }, function (error) {
                        setError(error);
                    });
                }, function (error) {
                    setError(error);
                });
            };

            // helper functions
            function setNestedObject(object, $scope) {
                $scope.result = ViewModelFactory.domainObjectViewModel(object);
                $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }

            function setError(error) {
                var errorRep;
                if (error instanceof Spiro.ErrorRepresentation) {
                    errorRep = error;
                } else {
                    errorRep = new Spiro.ErrorRepresentation({ message: "an unrecognised error has occurred" });
                }
                Context.setError(errorRep);
            }

            // expose for testing
            this.setResult = function (result, dvm, show) {
                if (result.result().isNull()) {
                    if (dvm) {
                        dvm.message = "no result found";
                    }
                    return;
                }

                var resultParm = "";
                var actionParm = "";

                if (result.resultType() === "object") {
                    var resultObject = result.result().object();

                    // set the nested object here and then update the url. That should reload the page but pick up this object
                    // so we don't hit the server again.
                    Context.setNestedObject(resultObject);

                    resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();
                    actionParm = show ? "&action=" + UrlHelper.action(dvm) : "";
                }

                if (result.resultType() === "list") {
                    var resultList = result.result().list();

                    Context.setCollection(resultList);

                    resultParm = "resultCollection=" + UrlHelper.action(dvm);
                    actionParm = show ? "&action=" + UrlHelper.action(dvm) : "";
                }
                $location.search(resultParm + actionParm);
            };

            this.setInvokeUpdateError = function ($scope, error, vms, vm) {
                if (error instanceof Spiro.ErrorMap) {
                    _.each(vms, function (vmi) {
                        var errorValue = error.valuesMap()[vmi.id];

                        if (errorValue) {
                            vmi.value = errorValue.value.toValueString();
                            vmi.message = errorValue.invalidReason;
                        }
                    });
                    vm.message = (error).invalidReason();
                } else if (error instanceof Spiro.ErrorRepresentation) {
                    var evm = ViewModelFactory.errorViewModel(error);
                    $scope.error = evm;
                    $scope.dialogTemplate = svrPath + "Content/partials/error.html";
                } else {
                    vm.message = error;
                }
            };

            this.invokeAction = function ($scope, action, dvm, show) {
                dvm.clearMessages();

                var invoke = action.getInvoke();
                invoke.attributes = {};

                var parameters = dvm.parameters;
                _.each(parameters, function (parm) {
                    return invoke.setParameter(parm.id, parm.getValue());
                });

                RepresentationLoader.populate(invoke, true).then(function (result) {
                    handlers.setResult(result, dvm, show);
                }, function (error) {
                    handlers.setInvokeUpdateError($scope, error, parameters, dvm);
                });
            };

            this.updateObject = function ($scope, object, ovm) {
                var update = object.getUpdateMap();

                var properties = _.filter(ovm.properties, function (property) {
                    return property.isEditable;
                });
                _.each(properties, function (property) {
                    return update.setProperty(property.id, property.getValue());
                });

                RepresentationLoader.populate(update, true, new Spiro.DomainObjectRepresentation()).then(function (updatedObject) {
                    // This is a kludge because updated object has no self link.
                    var rawLinks = (object).get("links");
                    (updatedObject).set("links", rawLinks);

                    // remove pre-changed object from cache
                    $cacheFactory.get('$http').remove(updatedObject.url());

                    Context.setObject(updatedObject);
                    $location.search("");
                }, function (error) {
                    handlers.setInvokeUpdateError($scope, error, properties, ovm);
                });
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.app.js.map
