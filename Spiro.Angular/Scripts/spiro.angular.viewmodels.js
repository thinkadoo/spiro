var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        var ChoiceViewModel = (function () {
            function ChoiceViewModel() {
            }
            ChoiceViewModel.create = function (value) {
                var choiceViewModel = new ChoiceViewModel();

                choiceViewModel.name = value.toString();
                choiceViewModel.value = value.isReference() ? value.link().href() : value.toValueString();
                return choiceViewModel;
            };
            return ChoiceViewModel;
        })();
        Angular.ChoiceViewModel = ChoiceViewModel;

        var ErrorViewModel = (function () {
            function ErrorViewModel() {
            }
            return ErrorViewModel;
        })();
        Angular.ErrorViewModel = ErrorViewModel;

        var LinkViewModel = (function () {
            function LinkViewModel() {
            }
            return LinkViewModel;
        })();
        Angular.LinkViewModel = LinkViewModel;

        var ItemViewModel = (function () {
            function ItemViewModel() {
            }
            return ItemViewModel;
        })();
        Angular.ItemViewModel = ItemViewModel;

        var MessageViewModel = (function () {
            function MessageViewModel() {
            }
            MessageViewModel.prototype.clearMessage = function () {
                this.message = "";
            };
            return MessageViewModel;
        })();
        Angular.MessageViewModel = MessageViewModel;

        var ValueViewModel = (function (_super) {
            __extends(ValueViewModel, _super);
            function ValueViewModel() {
                _super.apply(this, arguments);
            }
            ValueViewModel.prototype.autoComplete = function (searchTerm) {
                return null;
            };

            ValueViewModel.prototype.getValue = function () {
                if (this.type === "scalar") {
                    if (this.returnType === "boolean" && !(this.value == null)) {
                        return new Spiro.Value(this.value);
                    }

                    return new Spiro.Value(this.value || "");
                }

                if (this.hasChoices || this.choice) {
                    if (this.choice.value) {
                        return new Spiro.Value({ href: this.choice.value, title: this.choice.name });
                    }
                    return new Spiro.Value("");
                }

                if (this.reference === "") {
                    return new Spiro.Value("");
                }

                return new Spiro.Value({ href: this.reference });
            };
            return ValueViewModel;
        })(MessageViewModel);
        Angular.ValueViewModel = ValueViewModel;

        var ParameterViewModel = (function (_super) {
            __extends(ParameterViewModel, _super);
            function ParameterViewModel() {
                _super.apply(this, arguments);
            }
            return ParameterViewModel;
        })(ValueViewModel);
        Angular.ParameterViewModel = ParameterViewModel;

        var ActionViewModel = (function () {
            function ActionViewModel() {
            }
            return ActionViewModel;
        })();
        Angular.ActionViewModel = ActionViewModel;

        var DialogViewModel = (function (_super) {
            __extends(DialogViewModel, _super);
            function DialogViewModel() {
                _super.apply(this, arguments);
            }
            DialogViewModel.prototype.doShow = function () {
            };
            DialogViewModel.prototype.doInvoke = function () {
            };

            DialogViewModel.prototype.clearMessages = function () {
                this.message = "";
                _.each(this.parameters, function (parm) {
                    return parm.clearMessage();
                });
            };
            return DialogViewModel;
        })(MessageViewModel);
        Angular.DialogViewModel = DialogViewModel;

        var PropertyViewModel = (function (_super) {
            __extends(PropertyViewModel, _super);
            function PropertyViewModel() {
                _super.apply(this, arguments);
            }
            return PropertyViewModel;
        })(ValueViewModel);
        Angular.PropertyViewModel = PropertyViewModel;

        var CollectionViewModel = (function () {
            function CollectionViewModel() {
            }
            return CollectionViewModel;
        })();
        Angular.CollectionViewModel = CollectionViewModel;

        var ServicesViewModel = (function () {
            function ServicesViewModel() {
            }
            return ServicesViewModel;
        })();
        Angular.ServicesViewModel = ServicesViewModel;

        var ServiceViewModel = (function () {
            function ServiceViewModel() {
            }
            return ServiceViewModel;
        })();
        Angular.ServiceViewModel = ServiceViewModel;

        var DomainObjectViewModel = (function (_super) {
            __extends(DomainObjectViewModel, _super);
            function DomainObjectViewModel() {
                _super.apply(this, arguments);
            }
            DomainObjectViewModel.prototype.doSave = function () {
            };
            return DomainObjectViewModel;
        })(MessageViewModel);
        Angular.DomainObjectViewModel = DomainObjectViewModel;
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.viewmodels.js.map
