/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {


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

    export class MessageViewModel {
     
        message: string;
       
    }

    export class ValueViewModel extends MessageViewModel {
        value: Object;    
        id: string; 
    }

    export class ParameterViewModel extends ValueViewModel{

        title: string;
        dflt: string; 
        choices: ChoiceViewModel[]; 
        hasChoices: boolean;
        type: string; 
        reference: string; 
        choice: ChoiceViewModel; 
        search: string; 
        format: string;
        returnType: string;

        clearMessage() {
            this.message = "";
        }

        autoComplete (any) : any {
           return null; 
        }

        getValue(): Value {
            if (this.type === "scalar") {

                if (this.returnType === "boolean" && !(this.value == null)) {
                    return new Value(this.value);
                }

                return new Value(this.value || "");
            }

            if (this.hasChoices || this.choice) {
                return new Value({ href: this.choice.value, title : this.choice.name });
            }

            if (this.reference === "") {
                return new Value("");
            }

            return new Value({ href: this.reference });
        }

    } 

    export class ActionViewModel {
        title: string;
        href: string;    
    } 

    export class DialogViewModel extends MessageViewModel {

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
    
    export class PropertyViewModel extends ValueViewModel {

        title: string;
       
        type: string;
        returnType: string;
        format: string;
        href: string;
        target: string;
        color: string; 
      
        isEditable: boolean;
        reference: string; 
        choices: ChoiceViewModel[]; 
        hasChoices: boolean; 

        getValue() : Value {
            if (this.type === "scalar") {

                if (this.returnType === "boolean" && !(this.value == null)) {
                    return new Value(this.value);
                }

                return new Value(this.value || "");
            }

            if (this.reference === "") {
                return new Value("");
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