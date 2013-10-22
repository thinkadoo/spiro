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

        Angular.app.directive('nogAutocomplete', function ($filter, $parse, Context) {
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

                    // var model = $parse(attrs.nogAutocomplete);
                    ngModel.$render = function () {
                        var cvm = ngModel.$modelValue;

                        if (cvm) {
                            ngModel.$parsers.push(function (val) {
                                return cvm;
                            });
                            ngModel.$setViewValue(cvm.name);
                            element.val(cvm.name);
                        }
                    };

                    var updateModel = function (cvm) {
                        Context.setSelectedChoice(cvm.id, cvm.search, cvm);

                        scope.$apply(function () {
                            ngModel.$parsers.push(function (val) {
                                return cvm;
                            });
                            ngModel.$setViewValue(cvm.name);
                            element.val(cvm.name);
                        });
                    };

                    optionsObj.source = function (request, response) {
                        var autocompletes = scope.select({ request: request.term });

                        scope.$apply(function () {
                            autocompletes.then(function (cvms) {
                                response(_.map(cvms, function (cvm) {
                                    return { "label": cvm.name, "value": cvm };
                                }));
                            }, function () {
                                response([]);
                            });
                        });
                    };

                    optionsObj.select = function (event, ui) {
                        updateModel(ui.item.value);
                        return false;
                    };

                    optionsObj.focus = function (event, ui) {
                        return false;
                    };

                    optionsObj.autoFocus = true;
                    optionsObj.minLength = 1;

                    var clearHandler = function () {
                        var value = $(this).val();

                        if (value.length == 0) {
                            updateModel(Angular.ChoiceViewModel.create(new Spiro.Value(""), ""));
                        }
                    };

                    element.keyup(clearHandler);
                    element.autocomplete(optionsObj);
                }
            };
        });

        Angular.app.directive('nogAttachment', function ($filter, $window) {
            return {
                // Enforce the angularJS default of restricting the directive to
                // attributes only
                restrict: 'A',
                // Always use along with an ng-model
                require: '?ngModel',
                // This method needs to be defined and passed in from the
                // passed in to the directive from the view controller
                //scope: {
                //    select: '&'        // Bind the select function we refer to the right scope
                //},
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel)
                        return;

                    function downloadFile(url, mt, success) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, true);
                        xhr.responseType = "blob";
                        xhr.setRequestHeader("Accept", mt);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4) {
                                if (success)
                                    success(xhr.response);
                            }
                        };
                        xhr.send(null);
                    }

                    function onInitFs(fs) {
                        console.log('Opened file system: ' + fs.name);
                    }

                    function displayInline(mt) {
                        if (mt === "image/jpeg" || mt === "image/gif" || mt === "application/octet-stream") {
                            return true;
                        }

                        return false;
                    }

                    var clickHandler = function () {
                        var attachment = ngModel.$modelValue;

                        var url = attachment.href;
                        var mt = attachment.mimeType;

                        downloadFile(url, mt, function (resp) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                $window.location.href = reader.result;
                            };
                            reader.readAsDataURL(resp);
                        });
                        return false;
                    };

                    ngModel.$render = function () {
                        var attachment = ngModel.$modelValue;

                        var url = attachment.href;
                        var mt = attachment.mimeType;

                        if (displayInline(mt)) {
                            downloadFile(url, mt, function (resp) {
                                var reader = new FileReader();
                                reader.onloadend = function () {
                                    element.append("<img src='" + reader.result + "'/>");
                                };
                                reader.readAsDataURL(resp);
                            });
                        } else {
                            var link = "<a href='" + url + "'><span></span>fileToDownload</a>";
                            element.append(link);
                            element.find("a").on('click', clickHandler);
                        }
                    };
                }
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.directives.js.map
