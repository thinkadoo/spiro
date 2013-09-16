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

    export function toColorFromHref(href : string) {      
        var type = typeFromUrl(href);
        return "bg-color-" + getColourMapValues(type)["backgroundColor"]; 
    }

    export function toColorFromType(type) {
        return "bg-color-" + getColourMapValues(type)["backgroundColor"];
    }

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
    } 


    export class LinkViewModel {
        title: string;
        href: string;
        color: string; 
    } 

    export class ItemViewModel {
        title: string;
        href: string;
        color: string;
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
        choice: ChoiceViewModel; 
        search: string; 
        format: string;

        clearMessage() {
            this.message = "";
        }

        autoComplete (any) : any {
           return null; 
        }

        getValue(): Value {
            if (this.type === "scalar") {
                return new Value(this.value || "");
            }

            if (this.hasChoices || this.choice) {
                return new Value({ href: this.choice.value, title : this.choice.name });
            }

            return new Value({ href: this.reference });
        }

    } 

    export class ActionViewModel {
        title: string;
        href: string;    
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

    } 
    
    export class PropertyViewModel {

        title: string;
        value: string;
        type: string;
        returnType: string;
        format: string;
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
    } 

    export class CollectionViewModel {

        title: string;
        size: number;
        pluralName: string;
        href: string;
        color: string; 
        items: LinkViewModel[]; 
        
       
    } 

    export class ServicesViewModel {
        
        title: string; 
        color: string; 
        items: LinkViewModel[]; 
            
       
    } 

    export class ServiceViewModel {

        title: string;
        serviceId: string;
        actions: ActionViewModel[];
        color: string; 
        href: string; 

        closeNestedObject: string; 
        closeCollection: string; 

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
        
       
    } 
}