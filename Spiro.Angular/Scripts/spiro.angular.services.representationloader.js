var Spiro;
(function (Spiro) {
    /// <reference path="typings/angularjs/angular.d.ts" />
    /// <reference path="typings/underscore/underscore.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        // TODO investigate using transformations to transform results
        Angular.app.service("RepLoader", function ($http, $q) {
            function getUrl(model) {
                var url = model.url();

                if (model.method === "GET" || model.method === "DELETE") {
                    var asJson = _.clone((model).attributes);

                    if (_.toArray(asJson).length > 0) {
                        var map = JSON.stringify(asJson);
                        var encodedMap = encodeURI(map);
                        url += "?" + encodedMap;
                    }
                }

                return url;
            }

            function getData(model) {
                var data = {};

                if (model.method === "POST" || model.method === "PUT") {
                    data = _.clone((model).attributes);
                }

                return data;
            }

            this.populate = function (model, ignoreCache, expected) {
                var response = expected || model;
                var useCache = !ignoreCache;

                var delay = $q.defer();

                var config = {
                    url: getUrl(model),
                    method: model.method,
                    cache: useCache,
                    data: getData(model)
                };

                $http(config).success(function (data, status, headers, config) {
                    (response).attributes = data;
                    delay.resolve(response);
                }).error(function (data, status, headers, config) {
                    if (status === 500) {
                        var error = new Spiro.ErrorRepresentation(data);
                        delay.reject(error);
                    } else if (status === 400 || status === 422) {
                        var errorMap = new Spiro.ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    } else {
                        delay.reject(headers().warning);
                    }
                });

                return delay.promise;
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.services.representationloader.js.map
