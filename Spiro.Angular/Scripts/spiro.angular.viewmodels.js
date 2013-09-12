var Spiro;
(function (Spiro) {
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        function hashCode(toHash) {
            var hash = 0, i, char;
            if (toHash.length == 0)
                return hash;
            for (i = 0; i < toHash.length; i++) {
                char = toHash.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash;
        }
        ;

        function getColourMapValues(dt) {
            var map = dt ? colourMap[dt] : defaultColour;
            if (!map) {
                var hash = Math.abs(hashCode(dt));
                var index = hash % 18;
                map = defaultColourArray[index];
                colourMap[dt] = map;
            }
            return map;
        }

        function typeFromUrl(url) {
            var typeRegex = /(objects|services)\/([\w|\.]+)/;
            var results = (typeRegex).exec(url);
            return (results && results.length > 2) ? results[2] : "";
        }

        function toColorFromHref(href) {
            var type = typeFromUrl(href);
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }
        Angular.toColorFromHref = toColorFromHref;

        function toColorFromType(type) {
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }
        Angular.toColorFromType = toColorFromType;

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

        var ParameterViewModel = (function () {
            function ParameterViewModel() {
            }
            ParameterViewModel.prototype.clearMessage = function () {
                this.message = "";
            };

            ParameterViewModel.prototype.autoComplete = function (parm) {
                // for testing
                return [ChoiceViewModel.create(new Spiro.Value(1))];
            };

            ParameterViewModel.prototype.getValue = function () {
                if (this.type === "scalar") {
                    return new Spiro.Value(this.value || "");
                }

                if (this.hasChoices) {
                    return new Spiro.Value({ href: this.choice.value, title: this.choice.name });
                }

                return new Spiro.Value({ href: this.reference });
            };
            return ParameterViewModel;
        })();
        Angular.ParameterViewModel = ParameterViewModel;

        var ActionViewModel = (function () {
            function ActionViewModel() {
            }
            return ActionViewModel;
        })();
        Angular.ActionViewModel = ActionViewModel;

        var DialogViewModel = (function () {
            function DialogViewModel() {
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
        })();
        Angular.DialogViewModel = DialogViewModel;

        var PropertyViewModel = (function () {
            function PropertyViewModel() {
            }
            PropertyViewModel.prototype.getValue = function () {
                if (this.type === "scalar") {
                    return new Spiro.Value(this.value || "");
                }

                return new Spiro.Value({ href: this.reference });
            };
            return PropertyViewModel;
        })();
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

        var DomainObjectViewModel = (function () {
            function DomainObjectViewModel() {
            }
            DomainObjectViewModel.prototype.doSave = function () {
            };
            return DomainObjectViewModel;
        })();
        Angular.DomainObjectViewModel = DomainObjectViewModel;
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.viewmodels.js.map
