var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="typings/underscore/underscore.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        // TODO rename
        Angular.app.service("Handlers", function ($routeParams, $location, $q, $cacheFactory, RepLoader, Context, ViewModelFactory, UrlHelper) {
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
                    return RepLoader.populate(collectionDetails);
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
                    return RepLoader.populate(actionTarget);
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
                    return RepLoader.populate(actionTarget);
                }).then(function (action) {
                    var result = action.getInvoke();
                    return RepLoader.populate(result, true);
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
                    return RepLoader.populate(propertyDetails);
                }).then(function (details) {
                    var target = details.value().link().getTarget();
                    return RepLoader.populate(target);
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
                        return RepLoader.populate(pm.getDetails());
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

                RepLoader.populate(invoke, true).then(function (result) {
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

                RepLoader.populate(update, true, new Spiro.DomainObjectRepresentation()).then(function (updatedObject) {
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
//# sourceMappingURL=spiro.angular.services.handlers.js.map
