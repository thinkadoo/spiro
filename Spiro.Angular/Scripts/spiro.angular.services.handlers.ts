/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />


module Spiro.Angular {


    export interface HandlersInterface {
        handleCollectionResult($scope): void;
        handleCollection($scope): void;
        handleActionDialog($scope): void;
        handleActionResult($scope): void;
        handleProperty($scope): void;
        handleCollectionItem($scope): void;
        handleError(error: any): void;
        handleServices($scope): void;
        handleService($scope): void;
        handleResult($scope): void;
        handleEditObject($scope): void;
        handleObject($scope): void;
        handleAppBar($scope): void;
    }

    // TODO rename 
    app.service("Handlers", function ($routeParams, $location, $q: ng.IQService, $cacheFactory, RepresentationLoader: RLInterface, Context: ContextInterface, ViewModelFactory: VMFInterface, UrlHelper: IUrlHelper) {

        var handlers = this;

        // tested
        this.handleCollectionResult = function ($scope) {
            Context.getCollection().
                then(function (list: ListRepresentation) {
                    $scope.collection = ViewModelFactory.collectionViewModel(list);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleCollection = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                    return RepresentationLoader.populate(collectionDetails);
                }).
                then(function (details: CollectionRepresentation) {
                    $scope.collection = ViewModelFactory.collectionViewModel(details);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleActionDialog = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var actionTarget = object.actionMember(UrlHelper.action()).getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    if (action.extensions().hasParams) {
                        $scope.dialogTemplate = svrPath + "Content/partials/dialog.html";
                        $scope.dialog = ViewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel, show: boolean) => void > _.partial(handlers.invokeAction, $scope, action));
                    }
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleActionResult = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var action = object.actionMember(UrlHelper.action());

                    if (action.extensions().hasParams) {
                        var delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var actionTarget = action.getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }).
                then(function (result: ActionResultRepresentation) {
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
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var propertyDetails = object.propertyMember($routeParams.property).getDetails();
                    return RepresentationLoader.populate(propertyDetails);
                }).
                then(function (details: PropertyRepresentation) {
                    var target = details.value().link().getTarget();
                    return RepresentationLoader.populate(target);
                }).
                then(function (object: DomainObjectRepresentation) {
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

            Context.getNestedObject(collectionItemType, collectionItemKey).
                then(function (object: DomainObjectRepresentation) {
                    setNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleServices = function ($scope) {
            Context.getServices().
                then(function (services: DomainServicesRepresentation) {
                    $scope.services = ViewModelFactory.servicesViewModel(services);
                    Context.setObject(null);
                    Context.setNestedObject(null);
                }, function (error) {
                    setError(error);
                });

        };

        // tested
        this.handleService = function ($scope) {
            Context.getObject($routeParams.sid).
                then(function (service: DomainObjectRepresentation) {
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

            Context.getNestedObject(dt, id).
                then(function (object: DomainObjectRepresentation) {
                    $scope.result = ViewModelFactory.domainObjectViewModel(object); // todo rename result
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

            // TODO create appbar viewmodel 

            if ($routeParams.dt && $routeParams.id) {
                Context.getObject($routeParams.dt, $routeParams.id).
                    then(function (object: DomainObjectRepresentation) {

                        $scope.appBar.hideEdit = !(object) || $routeParams.editMode || false;

                        // rework to use viewmodel code
                        $scope.appBar.doEdit = "#" + $location.path() + "?editMode=true";

                    });
            }
        };

        //tested
        this.handleObject = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {

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

            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var detailPromises = _.map(object.propertyMembers(), (pm: PropertyMember) => { return RepresentationLoader.populate(pm.getDetails()) });

                    $q.all(detailPromises).then(function (details: PropertyRepresentation[]) {
                        Context.setNestedObject(null);
                        $scope.actionTemplate = "";
                        $scope.propertiesTemplate = svrPath + "Content/partials/editProperties.html";

                        $scope.object = ViewModelFactory.domainObjectViewModel(object, details, <(ovm: DomainObjectViewModel) => void > _.partial(handlers.updateObject, $scope, object));

                    }, function (error) {
                            setError(error);
                        });
                }, function (error) {
                    setError(error);
                });

        };

        // helper functions 

        function setNestedObject(object: DomainObjectRepresentation, $scope) {
            $scope.result = ViewModelFactory.domainObjectViewModel(object); // todo rename result
            $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
            Context.setNestedObject(object);
        }

        function setError(error) {

            var errorRep: ErrorRepresentation;
            if (error instanceof ErrorRepresentation) {
                errorRep = <ErrorRepresentation>error;
            }
            else {
                errorRep = new ErrorRepresentation({ message: "an unrecognised error has occurred" });
            }
            Context.setError(errorRep);
        }

        // expose for testing 

        this.setResult = function (result: ActionResultRepresentation, dvm?: DialogViewModel, show?: boolean) {
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

                resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();  // todo add some parm handling code 
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

        this.setInvokeUpdateError = function ($scope, error: any, vms: { id: string; value: string; message: string; }[], vm: { message: string; }) {
            if (error instanceof ErrorMap) {
                _.each(vms, (vmi) => {
                    var errorValue = error.valuesMap()[vmi.id];

                    if (errorValue) {
                        vmi.value = errorValue.value.toValueString();
                        vmi.message = errorValue.invalidReason;
                    }
                });
                vm.message = (<ErrorMap>error).invalidReason();
            }
            else if (error instanceof ErrorRepresentation) {
                var evm = ViewModelFactory.errorViewModel(error);
                $scope.error = evm;
                $scope.dialogTemplate = svrPath + "Content/partials/error.html";
            }
            else {
                vm.message = error;
            }
        };

        this.invokeAction = function ($scope, action: Spiro.ActionRepresentation, dvm: DialogViewModel, show: boolean) {
            dvm.clearMessages();

            var invoke = action.getInvoke();
            invoke.attributes = {}; // todo make automatic 

            var parameters = dvm.parameters;
            _.each(parameters, (parm) => invoke.setParameter(parm.id, parm.getValue()));

            RepresentationLoader.populate(invoke, true).
                then(function (result: ActionResultRepresentation) {
                    handlers.setResult(result, dvm, show);
                }, function (error: any) {
                    handlers.setInvokeUpdateError($scope, error, parameters, dvm);
                });
        };

        this.updateObject = function ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) {
            var update = object.getUpdateMap();

            var properties = _.filter(ovm.properties, (property) => property.isEditable);
            _.each(properties, (property) => update.setProperty(property.id, property.getValue()));

            RepresentationLoader.populate(update, true, new DomainObjectRepresentation()).
                then(function (updatedObject: DomainObjectRepresentation) {

                    // This is a kludge because updated object has no self link.
                    var rawLinks = (<any>object).get("links");
                    (<any>updatedObject).set("links", rawLinks);

                    // remove pre-changed object from cache
                    $cacheFactory.get('$http').remove(updatedObject.url());

                    Context.setObject(updatedObject);
                    $location.search("");
                }, function (error: any) {
                    handlers.setInvokeUpdateError($scope, error, properties, ovm);
                });
        };

    });
}