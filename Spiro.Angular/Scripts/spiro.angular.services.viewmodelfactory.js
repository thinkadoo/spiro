var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="typings/underscore/underscore.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        Angular.app.service('ViewModelFactory', function ($q, $location, UrlHelper, RepLoader, Color) {
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
                linkViewModel.color = Color.toColorFromHref(linkRep.href());
                return linkViewModel;
            };

            viewModelFactory.itemViewModel = function (linkRep, parentHref, index) {
                var linkViewModel = new Angular.LinkViewModel();
                linkViewModel.title = linkRep.title();
                linkViewModel.href = UrlHelper.toItemUrl(parentHref, linkRep.href());
                linkViewModel.color = Color.toColorFromHref(linkRep.href());
                return linkViewModel;
            };

            viewModelFactory.parameterViewModel = function (parmRep, id, previousValue) {
                var parmViewModel = new Angular.ParameterViewModel();

                parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";

                parmViewModel.title = parmRep.extensions().friendlyName;
                parmViewModel.dflt = parmRep.default().toValueString();
                parmViewModel.message = "";

                if (parmRep.extensions().returnType === "boolean") {
                    parmViewModel.value = previousValue ? previousValue.toLowerCase() === 'true' : parmRep.default().scalar();
                } else {
                    parmViewModel.value = previousValue || parmViewModel.dflt;
                }

                parmViewModel.id = id;
                parmViewModel.returnType = parmRep.extensions().returnType;
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

                parmViewModel.autoComplete = function (request) {
                    var object = new Spiro.DomainObjectRepresentation();

                    object.hateoasUrl = appPath + "/objects/" + parmRep.extensions().returnType + "/" + request;

                    return RepLoader.populate(object).then(function (d) {
                        var delay = $q.defer();

                        var l = d.selfLink();
                        l.set("title", d.title());
                        var v = new Spiro.Value(l);

                        var cvm = Angular.ChoiceViewModel.create(v);

                        delay.resolve(cvm);

                        return delay.promise;
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
                propertyViewModel.value = propertyRep.isScalar() ? propertyRep.value().scalar() : propertyRep.value().toString();
                propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
                propertyViewModel.returnType = propertyRep.extensions().returnType;
                propertyViewModel.format = propertyRep.extensions().format;
                propertyViewModel.href = propertyRep.isScalar() || propertyRep.detailsLink() == null ? "" : UrlHelper.toPropertyUrl(propertyRep.detailsLink().href());
                propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : UrlHelper.toAppUrl(propertyRep.value().link().href());
                propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

                propertyViewModel.color = Color.toColorFromType(propertyRep.extensions().returnType);
                propertyViewModel.id = id;
                propertyViewModel.isEditable = !propertyRep.disabledReason();
                propertyViewModel.choices = [];
                propertyViewModel.hasChoices = false;

                if (propertyDetails) {
                    propertyViewModel.choices = _.map(propertyDetails.choices(), function (v) {
                        return Angular.ChoiceViewModel.create(v);
                    });
                }

                propertyViewModel.hasChoices = propertyViewModel.choices.length > 0;

                if (propertyViewModel.hasChoices) {
                    propertyViewModel.choice = _.find(propertyViewModel.choices, function (c) {
                        return c.name == propertyRep.value().toString();
                    });
                } else if (propertyViewModel.type === "ref") {
                    propertyViewModel.choice = Angular.ChoiceViewModel.create(propertyRep.value());
                } else {
                    propertyViewModel.choice = null;
                }

                propertyViewModel.autoComplete = function (request) {
                    var object = new Spiro.DomainObjectRepresentation();

                    object.hateoasUrl = appPath + "/objects/" + propertyRep.extensions().returnType + "/" + request;

                    return RepLoader.populate(object).then(function (d) {
                        var delay = $q.defer();

                        var l = d.selfLink();
                        l.set("title", d.title());
                        var v = new Spiro.Value(l);

                        var cvm = Angular.ChoiceViewModel.create(v);

                        delay.resolve(cvm);

                        return delay.promise;
                    });
                };

                return propertyViewModel;
            };

            function create(collectionRep) {
                var collectionViewModel = new Angular.CollectionViewModel();

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = collectionRep.size();
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = collectionRep.detailsLink() ? UrlHelper.toCollectionUrl(collectionRep.detailsLink().href()) : "";
                collectionViewModel.color = Color.toColorFromType(collectionRep.extensions().elementType);

                collectionViewModel.items = [];

                return collectionViewModel;
            }

            function createFromDetails(collectionRep) {
                var collectionViewModel = new Angular.CollectionViewModel();
                var links = collectionRep.value().models;

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.selfLink().href());
                collectionViewModel.color = Color.toColorFromType(collectionRep.extensions().elementType);

                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return viewModelFactory.itemViewModel(link, collectionViewModel.href, i++);
                });

                return collectionViewModel;
            }

            function createFromList(listRep) {
                var collectionViewModel = new Angular.CollectionViewModel();
                var links = listRep.value().models;

                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = "Objects";

                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return viewModelFactory.itemViewModel(link, $location.path(), i++);
                });

                return collectionViewModel;
            }

            viewModelFactory.collectionViewModel = function (collection) {
                if (collection instanceof Spiro.CollectionMember) {
                    return create(collection);
                }
                if (collection instanceof Spiro.CollectionRepresentation) {
                    return createFromDetails(collection);
                }
                if (collection instanceof Spiro.ListRepresentation) {
                    return createFromList(collection);
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
                serviceViewModel.color = Color.toColorFromType(serviceRep.serviceId());
                serviceViewModel.href = UrlHelper.toAppUrl(serviceRep.getUrl());

                return serviceViewModel;
            };

            viewModelFactory.domainObjectViewModel = function (objectRep, details, save) {
                var objectViewModel = new Angular.DomainObjectViewModel();
                var isTransient = !!objectRep.persistLink();

                objectViewModel.href = UrlHelper.toAppUrl(objectRep.getUrl());

                objectViewModel.cancelEdit = isTransient ? "" : UrlHelper.toAppUrl(objectRep.getUrl());

                objectViewModel.color = Color.toColorFromType(objectRep.domainType());

                objectViewModel.doSave = save ? function () {
                    return save(objectViewModel);
                } : function () {
                };

                var properties = objectRep.propertyMembers();
                var collections = objectRep.collectionMembers();
                var actions = objectRep.actionMembers();

                objectViewModel.domainType = objectRep.domainType();
                objectViewModel.title = isTransient ? "Unsaved " + objectRep.extensions().friendlyName : objectRep.title();

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
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.services.viewmodelfactory.js.map
