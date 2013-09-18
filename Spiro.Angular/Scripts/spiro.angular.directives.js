var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    /// <reference path="spiro.angular.app.ts" />
    // tested
    (function (Angular) {
        // based on code in AngularJs, Green and Seshadri, O'Reilly
        Angular.app.directive('nogDatepicker', function ($filter) {
            return {
                // Enforce the angularJS default of restricting the directive to
                // attributes only
                restrict: 'A',
                // Always use along with an ng-model
                require: '?ngModel',
                // This method needs to be defined and passed in from the
                // passed in to the directive from the view controller
                scope: {
                    select: '&'
                },
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel)
                        return;

                    var optionsObj = {};

                    optionsObj.dateFormat = 'd M yy';
                    var updateModel = function (dateTxt) {
                        scope.$apply(function () {
                            // Call the internal AngularJS helper to
                            // update the two way binding
                            ngModel.$parsers.push(function (val) {
                                return new Date(val).toISOString();
                            });
                            ngModel.$setViewValue(dateTxt);
                        });
                    };

                    optionsObj.onSelect = function (dateTxt, picker) {
                        updateModel(dateTxt);
                        if (scope.select) {
                            scope.$apply(function () {
                                scope.select({ date: dateTxt });
                            });
                        }
                    };

                    ngModel.$render = function () {
                        var formattedDate = $filter('date')(ngModel.$viewValue, 'd MMM yyyy');

                        // Use the AngularJS internal 'binding-specific' variable
                        element.datepicker('setDate', formattedDate);
                    };
                    element.datepicker(optionsObj);
                }
            };
        });

        Angular.app.directive('nogAutocomplete', function ($filter, $parse) {
            return {
                // Enforce the angularJS default of restricting the directive to
                // attributes only
                restrict: 'A',
                // Always use along with an ng-model
                require: '?ngModel',
                // This method needs to be defined and passed in from the
                // passed in to the directive from the view controller
                scope: {
                    select: '&'
                },
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel)
                        return;

                    var optionsObj = {};

                    var model = $parse(attrs.nogAutocomplete);

                    ngModel.$render = function () {
                    };

                    var updateModel = function (cvm) {
                        scope.$apply(function () {
                            ngModel.$parsers.push(function (val) {
                                return cvm;
                            });

                            ngModel.$setViewValue(cvm.name);

                            element.val(cvm.name);
                        });
                    };

                    optionsObj.source = function (request, response) {
                        var test = scope.select({ request: request.term });

                        test.then(function (cvm) {
                            response([{ "label": cvm.name, "value": cvm }]);
                        });
                    };

                    optionsObj.select = function (event, ui) {
                        updateModel(ui.item.value);
                        return false;
                    };

                    optionsObj.autoFocus = true;
                    optionsObj.minLength = 2;

                    element.autocomplete(optionsObj);
                }
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.directives.js.map
