/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    interface ColourMapItemInterface {
        [index: string]: string;
    }

    interface ColourMapInterface {
        [index: string]: ColourMapItemInterface;
    }

    declare var colourMap: ColourMapInterface;
    declare var defaultColourArray: ColourMapItemInterface[];
    declare var defaultColour: ColourMapItemInterface;

    function hashCode(toHash) {
        var hash = 0, i, char;
        if (toHash.length == 0) return hash;
        for (i = 0; i < toHash.length; i++) {
            char = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function getColourMapValues(dt : string) {
        var map = dt ? colourMap[dt] : defaultColour;
        if (!map) {
            var hash = Math.abs(hashCode(dt));
            var index = hash % 18;
            map = defaultColourArray[index];
            colourMap[dt] = map;
        }
        return map;
    }

    function typeFromUrl(url : string) : string {
        var typeRegex = /(objects|services)\/([\w|\.]+)/;
        var results = (typeRegex).exec(url);
        return (results && results.length > 2) ? results[2] : "";
    }

    function toColorFromHref(href : string) {      
        var type = typeFromUrl(href);
        return "bg-color-" + getColourMapValues(type)["backgroundColor"]; 
    }

    function toColorFromType(type) {
        return "bg-color-" + getColourMapValues(type)["backgroundColor"];
    }


    // TODO rewrite all the parm handling code into a window manager class 
    // state from $routeParams driven by events 
    //export function getOtherParms($routeParams, UrlHelper : IUrlHelper, excepts?: string[]) {

    //    function include(parm) {
    //        return $routeParams[parm] && !_.any(excepts, (except) => parm === except); 
    //    }

    //    function getParm(name: string) {
    //        return include(name) ? "&" + name + "=" + $routeParams[name] : "";
    //    }
    
    //    var actionParm = include("action") ? "&action=" + UrlHelper.action() : "";
    //    var collectionParm = include("collection") ? "&collection=" + $routeParams.collection : "";
    //    var collectionItemParm = include("collectionItem") ? "&collectionItem=" + $routeParams.collectionItem : "";
    //    var propertyParm = include("property") ? "&property=" + $routeParams.property : "";
    //    var resultObjectParm = include("resultObject") ? "&resultObject=" + $routeParams.resultObject : "";
    //    var resultCollectionParm = include("resultCollection") ? "&resultCollection=" + $routeParams.resultCollection : "";

    //    return actionParm + collectionParm + collectionItemParm + propertyParm + resultObjectParm + resultCollectionParm; 
    //}

    //// move to url helper ? 
    //function toAppUrl(href : string, UrlHelper?, $routeParams?, toClose? : string[]) : string {
    //    var urlRegex = /(objects|services)\/(.*)/;
    //    var results = (urlRegex).exec(href);
    //    var parms = ""; 

    //    if (toClose) {
    //        parms = getOtherParms($routeParams, UrlHelper, toClose); 
    //        parms = parms ? "?" + parms.substr(1) : ""; 
    //    }

    //    return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2]  + parms: "";
    //}

    
    //function toActionUrl(href: string, $routeParams): string {
    //    var urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.]+)?)\/actions\/([\w|\.]+)/;
    //    var results = (urlRegex).exec(href);
    //    return (results && results.length > 3) ? "#/" + results[1] + "/" + results[2] + "?action=" + results[4] + getOtherParms($routeParams, ["action"]) : "";
    //}

    //function toPropertyUrl(href: string, $routeParams): string {
    //    var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(properties)\/([\w|\.]+)/;
    //    var results = (urlRegex).exec(href);   
    //    return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?property=" + results[5] + getOtherParms($routeParams, ["property", "collectionItem", "resultObject"]) : "";
    //}

    //function toCollectionUrl(href: string, $routeParams): string {
    //    var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(collections)\/([\w|\.]+)/;
    //    var results = (urlRegex).exec(href); 
    //    return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collection=" + results[5] + getOtherParms($routeParams, ["collection", "resultCollection"])  : "";
    //}

    //function toItemUrl(href: string, itemHref: string, $routeParams): string {
    //    var parentUrlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)/;
    //    var itemUrlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)/;
    //    var parentResults = (parentUrlRegex).exec(href);   
    //    var itemResults = (itemUrlRegex).exec(itemHref);    
    //    return (parentResults && parentResults.length > 2) ? "#/" + parentResults[1] + "/" + parentResults[2] + "?collectionItem=" + itemResults[2] + "/" + itemResults[3] + getOtherParms($routeParams, ["property", "collectionItem", "resultObject"])  : "";
    //}

    export class ChoiceViewModel {
        name: string;
        value: string;

        static create(value: Value) {
            var choiceViewModel = new ChoiceViewModel();

            choiceViewModel.name = value.toString(); 
            choiceViewModel.value = value.isReference() ? value.link().href() : value.toValueString();
            return choiceViewModel;
        } 
    }

    export class ErrorViewModel {

        message: string;
        stackTrace: string[];
       
        static create(errorRep: ErrorRepresentation) {
            var errorViewModel = new ErrorViewModel();
            errorViewModel.message = errorRep.message() || "An Error occurred";
            var stackTrace = errorRep.stacktrace();

            errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace; 
            return errorViewModel;
        }
    } 


    export class LinkViewModel {

        title: string;
        href: string;
        color: string; 

        static create(linkRep: Link, UrlHelper : IUrlHelper) {
            var linkViewModel = new LinkViewModel(); 
            linkViewModel.title = linkRep.title();
            linkViewModel.href = UrlHelper.toAppUrl(linkRep.href()); 
            linkViewModel.color = toColorFromHref(linkRep.href());
            return linkViewModel;
        }
    } 

    export class ItemViewModel {

        title: string;
        href: string;
        color: string;

        static create(linkRep: Link, parentHref: string, index: number, UrlHelper: IUrlHelper) {
            var linkViewModel = new LinkViewModel();
            linkViewModel.title = linkRep.title();
            linkViewModel.href = UrlHelper.toItemUrl(parentHref, linkRep.href());
            linkViewModel.color = toColorFromHref(linkRep.href());
            return linkViewModel;
        }
    }

    export class ParameterViewModel {

        title: string;
        dflt: string; 
        value: string; 
        message: string; 
        id: string; 
        choices: ChoiceViewModel[]; 
        hasChoices: boolean;
        type: string; 
        reference: string; 

        clearMessage() {
            this.message = "";
        }

        getValue(): Value {
            if (this.type === "scalar") {
                return new Value(this.value || "");
            }

            return new Value({ href: this.reference });
        }

        static create(parmRep: Parameter, id: string, previousValue : string) {
            var parmViewModel = new ParameterViewModel();

            parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";

            parmViewModel.title = parmRep.extensions().friendlyName;
            parmViewModel.dflt = parmRep.default().toValueString();
            parmViewModel.message = "";
            parmViewModel.value = previousValue;
            parmViewModel.id = id;

            parmViewModel.reference = "";

            parmViewModel.choices = _.map(parmRep.choices(), (v) => {
                return ChoiceViewModel.create(v);
            });
            parmViewModel.hasChoices = parmViewModel.choices.length > 0;

            return parmViewModel;
        }
    } 

    export class ActionViewModel {

        title: string;
        href: string;

        static create(actionRep: ActionMember, UrlHelper : IUrlHelper) {
            var actionViewModel = new ActionViewModel();
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = UrlHelper.toActionUrl(actionRep.detailsLink().href());
            return actionViewModel;
        }
    } 

    export class DialogViewModel {

        title: string;
        message: string;
        close: string; 
        isQuery: boolean; 

        parameters: ParameterViewModel[];

        doShow() { }
        doInvoke() { }

        clearMessages() {
            this.message = ""; 
            _.each(this.parameters, (parm) => parm.clearMessage());
        }

        static create(actionRep: ActionRepresentation, UrlHelper : IUrlHelper, invoke: (dvm : DialogViewModel, show : boolean) => void ) {
            var dialogViewModel = new DialogViewModel();
            var parameters = actionRep.parameters();
            var parms = UrlHelper.actionParms(); 

            dialogViewModel.title = actionRep.extensions().friendlyName;
            dialogViewModel.isQuery = actionRep.invokeLink().method() === "GET";

            dialogViewModel.message = "";

            dialogViewModel.close = UrlHelper.toAppUrl(actionRep.upLink().href(), ["action"]); 

            var i = 0; 
            dialogViewModel.parameters = _.map(parameters, (parm, id?) => { return ParameterViewModel.create(parm, id, parms[i++]); });

            dialogViewModel.doShow = () => invoke(dialogViewModel, true); 
            dialogViewModel.doInvoke = () => invoke(dialogViewModel, false);  

            return dialogViewModel;
        }
    } 
    
    export class PropertyViewModel {

        title: string;
        value: string;
        type: string;
        returnType: string;
        href: string;
        target: string;
        color: string; 
        id: string; 
        message: string; 
        isEditable: boolean;
        reference: string; 
        choices: ChoiceViewModel[]; 
        hasChoices: boolean; 

        getValue() : Value {
            if (this.type === "scalar") {
                return new Value(this.value || "");
            }

            return new Value({ href: this.reference });
        }

        static create(propertyRep: PropertyMember, id : string, UrlHelper : IUrlHelper, propertyDetails? : PropertyRepresentation) {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.href = propertyRep.isScalar() ? "" : UrlHelper.toPropertyUrl(propertyRep.detailsLink().href());
            propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : UrlHelper.toAppUrl(propertyRep.value().link().href());
            propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

            propertyViewModel.color = toColorFromType(propertyRep.extensions().returnType); 
            propertyViewModel.id = id;
            propertyViewModel.isEditable = !propertyRep.disabledReason(); 

            if (propertyDetails) {
                propertyViewModel.choices = _.map(propertyDetails.choices(), (v) => {
                    return ChoiceViewModel.create(v);
                });
                propertyViewModel.hasChoices = propertyViewModel.choices.length > 0; 
            }  

            return propertyViewModel;
        }

    } 

    export class CollectionViewModel {

        title: string;
        size: number;
        pluralName: string;
        href: string;
        color: string; 
        items: LinkViewModel[]; 
        
        static create(collectionRep: CollectionMember, UrlHelper : IUrlHelper) {
            var collectionViewModel = new CollectionViewModel();
          
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;
            
            collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.detailsLink().href());
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);
            
            collectionViewModel.items = [];

            return collectionViewModel;
        }

        static createFromDetails(collectionRep: CollectionRepresentation, UrlHelper: IUrlHelper) {
            var collectionViewModel = new CollectionViewModel();
            var links = collectionRep.value().models;
            
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = UrlHelper.toCollectionUrl(collectionRep.selfLink().href());
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);

            var i = 0; 
            collectionViewModel.items = _.map(links, (link) => { return ItemViewModel.create(link, collectionViewModel.href, i++, UrlHelper); });

            return collectionViewModel;
        }

        static createFromList(listRep: ListRepresentation, UrlHelper: IUrlHelper, $location) {
            var collectionViewModel = new CollectionViewModel();
            var links = listRep.value().models;

            //collectionViewModel.title = listRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = "Objects";

            //collectionViewModel.href = toCollectionUrl(collectionRep.selfLink().href(), $routeParams);
            //collectionViewModel.color = toColorFromType(listRep.extensions().elementType);

            var i = 0;
            collectionViewModel.items = _.map(links, (link) => { return ItemViewModel.create(link, $location.path(), i++, UrlHelper); });

            return collectionViewModel;
        }

    } 

    export class ServicesViewModel {
        
        title: string; 
        color: string; 
        items: LinkViewModel[]; 
            
        static create(servicesRep: DomainServicesRepresentation, UrlHelper : IUrlHelper) {
            var servicesViewModel = new ServicesViewModel(); 
            var links = servicesRep.value().models;
            servicesViewModel.title = "Services";
            servicesViewModel.color = "bg-color-darkBlue";
            servicesViewModel.items = _.map(links, (link) => { return LinkViewModel.create(link, UrlHelper); });
            return servicesViewModel;
        }
    } 

    export class ServiceViewModel {

        title: string;
        serviceId: string;
        actions: ActionViewModel[];
        color: string; 
        href: string; 

        closeNestedObject: string; 
        closeCollection: string; 

        static create(serviceRep: DomainObjectRepresentation, UrlHelper : IUrlHelper) {
            var serviceViewModel = new ServiceViewModel();
            var actions = serviceRep.actionMembers();
            serviceViewModel.serviceId = serviceRep.serviceId();
            serviceViewModel.title = serviceRep.title();
            serviceViewModel.actions = _.map(actions, (action) => { return ActionViewModel.create(action, UrlHelper); });
            serviceViewModel.color = toColorFromType(serviceRep.serviceId());
            serviceViewModel.href = UrlHelper.toAppUrl(serviceRep.getUrl()); 
            serviceViewModel.closeNestedObject = UrlHelper.toAppUrl(serviceRep.getUrl(), ["property", "collectionItem", "resultObject"]); 
            serviceViewModel.closeCollection = UrlHelper.toAppUrl(serviceRep.getUrl(), ["collection", "resultCollection"]); 

            return serviceViewModel;
        }
    } 

    export class DomainObjectViewModel {

        title: string;
        domainType: string; 
        properties: PropertyViewModel[];
        collections: CollectionViewModel[];
        actions: ActionViewModel[];
        color: string; 
        href: string; 
        message: string; 
   
        closeNestedObject: string; 
        closeCollection: string; 
        cancelEdit: string; 

        doSave(): void {}
        
        update(objectRep: DomainObjectRepresentation, $routeParams, details? : PropertyRepresentation[]) {
            
            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();
            
            this.domainType = objectRep.domainType();
            this.title = objectRep.title();
          
            this.message = ""; 

            this.properties = _.map(properties, (property, id?) => { return PropertyViewModel.create(property, id, $routeParams, _.find(details, (d) => { return d.instanceId() === id } )); });
            this.collections = _.map(collections, (collection) => { return CollectionViewModel.create(collection, $routeParams); });
            this.actions = _.map(actions, (action) => { return ActionViewModel.create(action, $routeParams); });
        }

        static create(objectRep: DomainObjectRepresentation, UrlHelper : IUrlHelper, details? : PropertyRepresentation[],  save? : (ovm : DomainObjectViewModel) => void) {
            var objectViewModel = new DomainObjectViewModel();
            
            objectViewModel.href = UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.closeNestedObject = UrlHelper.toAppUrl(objectRep.getUrl(), ["property", "collectionItem", "resultObject"]);
            objectViewModel.closeCollection = UrlHelper.toAppUrl(objectRep.getUrl(), ["collection", "resultCollection"]);

            objectViewModel.cancelEdit = UrlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.color = toColorFromType(objectRep.domainType());

            objectViewModel.doSave = save ? () => save(objectViewModel) : () => { };

            objectViewModel.update(objectRep, details || []); 

            return objectViewModel;
        }
    } 
}