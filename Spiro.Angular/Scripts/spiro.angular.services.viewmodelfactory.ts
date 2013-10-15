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
        dialogViewModel(actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel) => void): DialogViewModel;
        propertyViewModel(propertyRep: PropertyMember, id: string, propertyDetails?: PropertyRepresentation): PropertyViewModel;
        collectionViewModel(collection: CollectionMember): CollectionViewModel;
        collectionViewModel(collection: CollectionRepresentation): CollectionViewModel;
        collectionViewModel(collection: ListRepresentation): CollectionViewModel;
        servicesViewModel(servicesRep: DomainServicesRepresentation): ServicesViewModel;
        serviceViewModel(serviceRep: DomainObjectRepresentation): ServiceViewModel;
        domainObjectViewModel(objectRep: DomainObjectRepresentation, details?: PropertyRepresentation[], save?: (ovm: DomainObjectViewModel) => void, previousUrl? : string): DomainObjectViewModel;
    }

    app.service('ViewModelFactory', function ($q : ng.IQService, $location : ng.ILocationService, UrlHelper: IUrlHelper, RepLoader: IRepLoader, Color : IColor) {

        var viewModelFactory = <IViewModelFactory>this;

        // TODO move to handlers ? + other functions in here 
        function autocomplete(list : ListRepresentation, searchTerm : string) : ng.IPromise<ChoiceViewModel[]> {
           
            list.attributes = {}; // kludge todo fix 

            list.setSearchTerm(searchTerm);

            return RepLoader.populate(list).then((l: ListRepresentation) => {
                var delay = $q.defer<ChoiceViewModel[]>();

                var cvms = _.map(l.value().models, (ll: Link) => {
                    var v = new Value(ll);
                    return ChoiceViewModel.create(v);
                });

                delay.resolve(cvms);
                return delay.promise;
            });
        }; 


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

            // use custom extension choices by preference 
            if (parmRep.extensions().choices) {
                parmViewModel.choices = _.map(parmRep.extensions().choices, (value, name) => {
                    var cvm = new ChoiceViewModel();
                    cvm.name = name;
                    cvm.value = value.toString();
                    return cvm;
                });
            }
            else {
                parmViewModel.choices = _.map(parmRep.choices(), (v) => {
                    return ChoiceViewModel.create(v);
                });
            }

            parmViewModel.hasChoices = parmViewModel.choices.length > 0;

            if (parmViewModel.hasChoices && previousValue) {
                if (parmViewModel.type == "scalar") {
                    parmViewModel.choice = _.find(parmViewModel.choices, (c) => c.value === previousValue);
                }
                else {
                    parmViewModel.choice = _.find(parmViewModel.choices, (c) => c.name === previousValue);
                }
            }

            parmViewModel.hasAutocomplete = !!parmRep.autocompleteLink();

            if (parmViewModel.hasAutocomplete) {
                var list = parmRep.getAutoCompletes();
                parmViewModel.autoComplete = <(st : string) => ng.IPromise<ChoiceViewModel[]>> _.partial(autocomplete, list);
            }

            return parmViewModel;
        };

        viewModelFactory.actionViewModel = function (actionRep: ActionMember) {
            var actionViewModel = new ActionViewModel();
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = UrlHelper.toActionUrl(actionRep.detailsLink().href());
            return actionViewModel;
        };

        viewModelFactory.dialogViewModel = function (actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel) => void) {
            var dialogViewModel = new DialogViewModel();
            var parameters = actionRep.parameters();
            var parms = UrlHelper.actionParms();

            dialogViewModel.title = actionRep.extensions().friendlyName;
            dialogViewModel.isQuery = actionRep.invokeLink().method() === "GET";

            dialogViewModel.message = "";

            dialogViewModel.close = UrlHelper.toAppUrl(actionRep.upLink().href(), ["action"]);

            var i = 0;
            dialogViewModel.parameters = _.map(parameters, (parm, id?) => { return viewModelFactory.parameterViewModel(parm, id, parms[i++]); });

            dialogViewModel.doShow = () => {
                dialogViewModel.show = true;
                invoke(dialogViewModel)
            };
            dialogViewModel.doInvoke = () => {
                dialogViewModel.show = false;
                invoke(dialogViewModel)
            };

            return dialogViewModel;
        };

        viewModelFactory.propertyViewModel = function (propertyRep: PropertyMember, id: string, propertyDetails?: PropertyRepresentation) {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.isScalar() ? propertyRep.value().scalar() : propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.format = propertyRep.extensions().format;
            propertyViewModel.href = propertyRep.isScalar() || propertyRep.detailsLink() == null ? "" : UrlHelper.toPropertyUrl(propertyRep.detailsLink().href());
            propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : UrlHelper.toAppUrl(propertyRep.value().link().href());
            propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

            // only set color if has value 
            propertyViewModel.color = propertyViewModel.value ? Color.toColorFromType(propertyRep.extensions().returnType) : "";

            propertyViewModel.id = id;
            propertyViewModel.isEditable = !propertyRep.disabledReason();
            propertyViewModel.choices = [];
            propertyViewModel.hasChoices = propertyRep.hasChoices();
            propertyViewModel.hasAutocomplete = propertyRep.hasAutoComplete();

            if (propertyRep.extensions().choices) {
                // may need to map value
                var arr = _.map(propertyRep.extensions().choices, (value, name) => {

                    return { name: name, value: value };
                });

                var mappedValue = _.find(arr, (nvp) => {
                    return nvp.value === propertyViewModel.value;
                });

                if (mappedValue) {
                    propertyViewModel.value = mappedValue.name;
                }
            }


            // use custom extension by preference
            if (propertyDetails && propertyDetails.extensions().choices) {
                propertyViewModel.choices = _.map(propertyDetails.extensions().choices, (value, name) => {
                    var cvm = new ChoiceViewModel();
                    cvm.name = name;
                    cvm.value = value;
                    return cvm;
                });
            }
            else if (propertyDetails && propertyViewModel.hasChoices) {
                propertyViewModel.choices = _.map(propertyDetails.choices(), (v) => {
                    return ChoiceViewModel.create(v);
                });
            }
       

            if (propertyViewModel.hasChoices) {
                propertyViewModel.choice = _.find(propertyViewModel.choices, (c) => c.name == propertyViewModel.value.toString());
            }
            else if (propertyViewModel.type === "ref") {
                propertyViewModel.choice = ChoiceViewModel.create(propertyRep.value());
            }
            else {
                propertyViewModel.choice = null;
            }

            if (propertyViewModel.hasAutocomplete && propertyDetails) {
                var list = propertyDetails.getAutoCompletes();
                propertyViewModel.autoComplete = <(st: string) => ng.IPromise<ChoiceViewModel[]>> _.partial(autocomplete, list);
            }
            else {
                propertyViewModel.autoComplete = (st: string) => {
                    return $q.when(<ChoiceViewModel[]>[]);
                };
            }

            return propertyViewModel;
        };

        function create(collectionRep: CollectionMember) {
            var collectionViewModel = new CollectionViewModel();

            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = collectionRep.detailsLink() ? UrlHelper.toCollectionUrl(collectionRep.detailsLink().href()) : "";
            collectionViewModel.color = Color.toColorFromType(collectionRep.extensions().elementType);

            collectionViewModel.items = [];

            return collectionViewModel;
        }

        function createFromDetails(collectionRep: CollectionRepresentation) {
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

        function createFromList(listRep: ListRepresentation) {
            var collectionViewModel = new CollectionViewModel();
            var links = listRep.value().models;
          
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = "Objects";

            var i = 0;
            collectionViewModel.items = _.map(links, (link) => { return viewModelFactory.itemViewModel(link, $location.path(), i++); });

            return collectionViewModel;
        }

        viewModelFactory.collectionViewModel = function (collection: any) {
            if (collection instanceof CollectionMember) {
                return create(<CollectionMember>collection);
            }
            if (collection instanceof CollectionRepresentation) {
                return createFromDetails(<CollectionRepresentation>collection);
            }
            if (collection instanceof ListRepresentation) {
                return createFromList(<ListRepresentation>collection);
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
            var isTransient = !!objectRep.persistLink();

            objectViewModel.href = UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.cancelEdit =  isTransient ? ""  :  UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.color = Color.toColorFromType(objectRep.domainType());

            objectViewModel.doSave = save ? () => save(objectViewModel) : () => { };

            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();

            objectViewModel.domainType = objectRep.domainType();
            objectViewModel.title = isTransient ? "Unsaved " + objectRep.extensions().friendlyName : objectRep.title();

            objectViewModel.message = "";

            objectViewModel.properties = _.map(properties, (property, id?) => { return viewModelFactory.propertyViewModel(property, id, _.find(details, (d) => { return d.instanceId() === id })); });
            objectViewModel.collections = _.map(collections, (collection) => { return viewModelFactory.collectionViewModel(collection); });
            objectViewModel.actions = _.map(actions, (action) => { return viewModelFactory.actionViewModel(action); });


            return objectViewModel;
        };
    });

}