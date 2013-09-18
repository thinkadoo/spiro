/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />


module Spiro.Angular {
    export interface IViewModelFactory {
        errorViewModel(errorRep: ErrorRepresentation): ErrorViewModel;
        linkViewModel(linkRep: Link): LinkViewModel;
        itemViewModel(linkRep: Link, parentHref: string, index: number): ItemViewModel;
        parameterViewModel(parmRep: Parameter, id: string, previousValue: string): ParameterViewModel;
        actionViewModel(actionRep: ActionMember): ActionViewModel;
        dialogViewModel(actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel, show: boolean) => void): DialogViewModel;
        propertyViewModel(propertyRep: PropertyMember, id: string, propertyDetails?: PropertyRepresentation): PropertyViewModel;
        collectionViewModel(collection: CollectionMember): CollectionViewModel;
        collectionViewModel(collection: CollectionRepresentation): CollectionViewModel;
        collectionViewModel(collection: ListRepresentation): CollectionViewModel;
        servicesViewModel(servicesRep: DomainServicesRepresentation): ServicesViewModel;
        serviceViewModel(serviceRep: DomainObjectRepresentation): ServiceViewModel;
        domainObjectViewModel(objectRep: DomainObjectRepresentation, details?: PropertyRepresentation[], save?: (ovm: DomainObjectViewModel) => void): DomainObjectViewModel;
    }

    app.service('ViewModelFactory', function ($q : ng.IQService, $location : ng.ILocationService, UrlHelper: IUrlHelper, RepLoader: IRepLoader, Color : IColor) {

        var viewModelFactory = <IViewModelFactory>this;

        viewModelFactory.errorViewModel = function (errorRep: ErrorRepresentation) {
            var errorViewModel = new ErrorViewModel();
            errorViewModel.message = errorRep.message() || "An Error occurred";
            var stackTrace = errorRep.stacktrace();

            errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace;
            return errorViewModel;
        };

        viewModelFactory.linkViewModel = function (linkRep: Link) {
            var linkViewModel = new LinkViewModel();
            linkViewModel.title = linkRep.title();
            linkViewModel.href = UrlHelper.toAppUrl(linkRep.href());
            linkViewModel.color = Color.toColorFromHref(linkRep.href());
            return linkViewModel;
        };

        viewModelFactory.itemViewModel = function (linkRep: Link, parentHref: string, index: number) {
            var linkViewModel = new LinkViewModel();
            linkViewModel.title = linkRep.title();
            linkViewModel.href = UrlHelper.toItemUrl(parentHref, linkRep.href());
            linkViewModel.color = Color.toColorFromHref(linkRep.href());
            return linkViewModel;
        };

        viewModelFactory.parameterViewModel = function (parmRep: Parameter, id: string, previousValue: string): any {
            var parmViewModel = new ParameterViewModel();

            parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";

            parmViewModel.title = parmRep.extensions().friendlyName;
            parmViewModel.dflt = parmRep.default().toValueString();
            parmViewModel.message = "";

            if (parmRep.extensions().returnType === "boolean") {
                parmViewModel.value = previousValue ? previousValue.toLowerCase() === 'true' : parmRep.default().scalar();
            }
            else {
                parmViewModel.value = previousValue || parmViewModel.dflt
            }

            parmViewModel.id = id;
            parmViewModel.returnType = parmRep.extensions().returnType;
            parmViewModel.format = parmRep.extensions().format;

            parmViewModel.reference = "";

            parmViewModel.choices = _.map(parmRep.choices(), (v) => {
                return ChoiceViewModel.create(v);
            });

            parmViewModel.hasChoices = parmViewModel.choices.length > 0;

            if (parmViewModel.hasChoices && previousValue) {
                parmViewModel.choice = _.find(parmViewModel.choices, (c) => c.name == previousValue);
            }

            parmViewModel.autoComplete = function (request): any {

                var object = new DomainObjectRepresentation();

                object.hateoasUrl = appPath + "/objects/" + parmRep.extensions().returnType + "/" + request;

                return RepLoader.populate(object).then((d: DomainObjectRepresentation) => {
                    var delay = $q.defer<ChoiceViewModel>();

                    var l = d.selfLink();
                    l.set("title", d.title());
                    var v = new Value(l);

                    var cvm = ChoiceViewModel.create(v);

                    delay.resolve(cvm);

                    return delay.promise;
                });
            }

            return parmViewModel;
        };

        viewModelFactory.actionViewModel = function (actionRep: ActionMember) {
            var actionViewModel = new ActionViewModel();
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = UrlHelper.toActionUrl(actionRep.detailsLink().href());
            return actionViewModel;
        };

        viewModelFactory.dialogViewModel = function (actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel, show: boolean) => void) {
            var dialogViewModel = new DialogViewModel();
            var parameters = actionRep.parameters();
            var parms = UrlHelper.actionParms();

            dialogViewModel.title = actionRep.extensions().friendlyName;
            dialogViewModel.isQuery = actionRep.invokeLink().method() === "GET";

            dialogViewModel.message = "";

            dialogViewModel.close = UrlHelper.toAppUrl(actionRep.upLink().href(), ["action"]);

            var i = 0;
            dialogViewModel.parameters = _.map(parameters, (parm, id?) => { return viewModelFactory.parameterViewModel(parm, id, parms[i++]); });

            dialogViewModel.doShow = () => invoke(dialogViewModel, true);
            dialogViewModel.doInvoke = () => invoke(dialogViewModel, false);

            return dialogViewModel;
        };

        viewModelFactory.propertyViewModel = function (propertyRep: PropertyMember, id: string, propertyDetails?: PropertyRepresentation) {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.isScalar() ? propertyRep.value().scalar() : propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.format = propertyRep.extensions().format;
            propertyViewModel.href = propertyRep.isScalar() ? "" : UrlHelper.toPropertyUrl(propertyRep.detailsLink().href());
            propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : UrlHelper.toAppUrl(propertyRep.value().link().href());
            propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

            propertyViewModel.color = Color.toColorFromType(propertyRep.extensions().returnType);
            propertyViewModel.id = id;
            propertyViewModel.isEditable = !propertyRep.disabledReason();

            if (propertyDetails) {
                propertyViewModel.choices = _.map(propertyDetails.choices(), (v) => {
                    return ChoiceViewModel.create(v);
                });
                propertyViewModel.hasChoices = propertyViewModel.choices.length > 0;
                propertyViewModel.choice = null; 

                propertyViewModel.autoComplete = function (request): any {

                    var object = new DomainObjectRepresentation();

                    object.hateoasUrl = appPath + "/objects/" + propertyRep.extensions().returnType + "/" + request;

                    return RepLoader.populate(object).then((d: DomainObjectRepresentation) => {
                        var delay = $q.defer<ChoiceViewModel>();

                        var l = d.selfLink();
                        l.set("title", d.title());
                        var v = new Value(l);

                        var cvm = ChoiceViewModel.create(v);

                        delay.resolve(cvm);

                        return delay.promise;
                    });
                }
            }

            return propertyViewModel;
        };

        function create(collectionRep: CollectionMember, UrlHelper: IUrlHelper) {
            var collectionViewModel = new CollectionViewModel();

            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.detailsLink().href());
            collectionViewModel.color = Color.toColorFromType(collectionRep.extensions().elementType);

            collectionViewModel.items = [];

            return collectionViewModel;
        }

        function createFromDetails(collectionRep: CollectionRepresentation, UrlHelper: IUrlHelper) {
            var collectionViewModel = new CollectionViewModel();
            var links = collectionRep.value().models;

            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.selfLink().href());
            collectionViewModel.color = Color.toColorFromType(collectionRep.extensions().elementType);

            var i = 0;
            collectionViewModel.items = _.map(links, (link) => { return viewModelFactory.itemViewModel(link, collectionViewModel.href, i++); });

            return collectionViewModel;
        }

        function createFromList(listRep: ListRepresentation, UrlHelper: IUrlHelper, $location) {
            var collectionViewModel = new CollectionViewModel();
            var links = listRep.value().models;

            //collectionViewModel.title = listRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = "Objects";

            //collectionViewModel.href = toCollectionUrl(collectionRep.selfLink().href(), $routeParams);
            //collectionViewModel.color = toColorFromType(listRep.extensions().elementType);

            var i = 0;
            collectionViewModel.items = _.map(links, (link) => { return viewModelFactory.itemViewModel(link, $location.path(), i++); });

            return collectionViewModel;
        }



        viewModelFactory.collectionViewModel = function (collection: any) {
            if (collection instanceof CollectionMember) {
                return create(<CollectionMember>collection, UrlHelper);
            }
            if (collection instanceof CollectionRepresentation) {
                return createFromDetails(<CollectionRepresentation>collection, UrlHelper);
            }
            if (collection instanceof ListRepresentation) {
                return createFromList(<ListRepresentation>collection, UrlHelper, $location);
            }
            return null;
        };

        viewModelFactory.servicesViewModel = function (servicesRep: DomainServicesRepresentation) {
            var servicesViewModel = new ServicesViewModel();
            var links = servicesRep.value().models;
            servicesViewModel.title = "Services";
            servicesViewModel.color = "bg-color-darkBlue";
            servicesViewModel.items = _.map(links, (link) => { return viewModelFactory.linkViewModel(link); });
            return servicesViewModel;
        };

        viewModelFactory.serviceViewModel = function (serviceRep: DomainObjectRepresentation) {
            var serviceViewModel = new ServiceViewModel();
            var actions = serviceRep.actionMembers();
            serviceViewModel.serviceId = serviceRep.serviceId();
            serviceViewModel.title = serviceRep.title();
            serviceViewModel.actions = _.map(actions, (action) => { return viewModelFactory.actionViewModel(action); });
            serviceViewModel.color = Color.toColorFromType(serviceRep.serviceId());
            serviceViewModel.href = UrlHelper.toAppUrl(serviceRep.getUrl());
          

            return serviceViewModel;
        };

        viewModelFactory.domainObjectViewModel = function (objectRep: DomainObjectRepresentation, details?: PropertyRepresentation[], save?: (ovm: DomainObjectViewModel) => void) {
            var objectViewModel = new DomainObjectViewModel();

            objectViewModel.href = UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.cancelEdit = UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.color = Color.toColorFromType(objectRep.domainType());

            objectViewModel.doSave = save ? () => save(objectViewModel) : () => { };

            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();

            objectViewModel.domainType = objectRep.domainType();
            objectViewModel.title = objectRep.title();

            objectViewModel.message = "";

            objectViewModel.properties = _.map(properties, (property, id?) => { return viewModelFactory.propertyViewModel(property, id, _.find(details, (d) => { return d.instanceId() === id })); });
            objectViewModel.collections = _.map(collections, (collection) => { return viewModelFactory.collectionViewModel(collection); });
            objectViewModel.actions = _.map(actions, (action) => { return viewModelFactory.actionViewModel(action); });


            return objectViewModel;
        };
    });

}