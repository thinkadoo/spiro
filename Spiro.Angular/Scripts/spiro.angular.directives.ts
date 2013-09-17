/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />

// tested 
module Spiro.Angular {

    interface ISelectScope extends ng.IScope {
        select: any;
    }

    // based on code in AngularJs, Green and Seshadri, O'Reilly
    app.directive('datepicker', function ($filter : ng.IFilterService) : ng.IDirective {
            return {
                // Enforce the angularJS default of restricting the directive to
                // attributes only
                restrict: 'A',
                // Always use along with an ng-model
                require: '?ngModel',
                // This method needs to be defined and passed in from the
                // passed in to the directive from the view controller
                scope: {
                    select: '&'        // Bind the select function we refer to the right scope
                },
                link: function (scope: ISelectScope, element, attrs, ngModel: ng.INgModelController) {
                    if (!ngModel) return;

                    var optionsObj: { dateFormat?: string; onSelect?: Function } = {};

                    optionsObj.dateFormat = 'd M yy'; // datepicker format
                    var updateModel = function (dateTxt) {
                        scope.$apply(function () {
                            // Call the internal AngularJS helper to
                            // update the two way binding

                            ngModel.$parsers.push((val) => { return new Date(val).toISOString() });
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
                        var formattedDate = $filter('date')(ngModel.$viewValue, 'd MMM yyyy'); // angularjs format

                        // Use the AngularJS internal 'binding-specific' variable
                        element.datepicker('setDate', formattedDate);
                    };
                    element.datepicker(optionsObj);
                }
            };
        });

}