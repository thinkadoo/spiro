/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {


    export class AttachmentViewModel {
        href: string;
        mimeType: string;

        static create(href : string, mimeType : string) {
            var attachmentViewModel = new AttachmentViewModel();

            attachmentViewModel.href = href;
            attachmentViewModel.mimeType = mimeType;

            return attachmentViewModel;
        }
    }

    export class ChoiceViewModel {
        id: string; 
        name: string;
        value: string;
        search: string; 

        static create(value: Value, id : string, searchTerm? : string) {
            var choiceViewModel = new ChoiceViewModel();

            choiceViewModel.id = id;
            choiceViewModel.name = value.toString(); 
            choiceViewModel.value = value.isReference() ? value.link().href() : value.toValueString();
            choiceViewModel.search = searchTerm || ""; 
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
       
        clearMessage() {
            this.message = "";
        }
    }

    export class ValueViewModel extends MessageViewModel {
        value: Object;    
        id: string; 
        choices: ChoiceViewModel[];
        hasChoices: boolean;
        hasAutocomplete : boolean; 
        type: string;
        reference: string;
        choice: ChoiceViewModel; 
        returnType: string;
        title: string;
        format: string;

        autoComplete(searchTerm: string): ng.IPromise<ChoiceViewModel[]> {
            return null;
        }

        getMemento(): string {
            return (this.choice && this.choice.search) ? this.choice.search : this.getValue().toString();
        }

        getValue(): Value {
           
            if (this.hasChoices || this.hasAutocomplete) {

                if (this.type === "scalar") {
                    return new Value(this.choice && this.choice.value != null ? this.choice.value : "");
                }

                // reference 
                return new Value(this.choice && this.choice.value ? { href: this.choice.value, title: this.choice.name } : null );
            }

            if (this.type === "scalar") {
                return new Value(this.value == null ? "" : this.value);
            }

            // reference
            return new Value(this.reference ? { href: this.reference } : null);
        }

    }

    export class ParameterViewModel extends ValueViewModel{
        dflt: string;       
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
        show: boolean; 

        parameters: ParameterViewModel[];

        doShow() { }
        doInvoke() { }

        clearMessages() {
            this.message = ""; 
            _.each(this.parameters, (parm) => parm.clearMessage());
        }

    } 
    
    export class PropertyViewModel extends ValueViewModel {

        href: string;
        target: string;
        color: string;       
        isEditable: boolean;    
        attachment: AttachmentViewModel;
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
    } 

    export class DomainObjectViewModel extends MessageViewModel{
        title: string;
        domainType: string; 
        properties: PropertyViewModel[];
        collections: CollectionViewModel[];
        actions: ActionViewModel[];
        color: string; 
        href: string; 
        cancelEdit: string; 
        doSave(): void {}
    } 
}