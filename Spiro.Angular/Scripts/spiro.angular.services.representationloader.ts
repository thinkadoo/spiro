/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />


module Spiro.Angular {

    export interface IRepLoader<T> {
        populate: (m: HateoasModel, ignoreCache?: boolean, r?: HateoasModel) => ng.IPromise<T>;
    }

    // TODO investigate using transformations to transform results 
    app.service("RepLoader", function ($http, $q) {

        function getUrl(model: HateoasModel): string {

            var url = model.url();

            if (model.method === "GET" || model.method === "DELETE") {
                var asJson = _.clone((<any>model).attributes);

                if (_.toArray(asJson).length > 0) {
                    var map = JSON.stringify(asJson);
                    var encodedMap = encodeURI(map);
                    url += "?" + encodedMap;
                }
            }

            return url;
        }

        function getData(model: HateoasModel): Object {

            var data = {};

            if (model.method === "POST" || model.method === "PUT") {
                data = _.clone((<any>model).attributes);
            }

            return data;
        }

        this.populate = function (model: HateoasModel, ignoreCache?: boolean, expected?: HateoasModel) {

            var response = expected || model;
            var useCache = !ignoreCache;

            var delay = $q.defer();

            var config = {
                url: getUrl(model),
                method: model.method,
                cache: useCache,
                data: getData(model)
            };

            $http(config).
                success(function (data, status, headers, config) {
                    (<any>response).attributes = data; // TODO make typed 
                    delay.resolve(response);
                }).
                error(function (data, status, headers, config) {

                    if (status === 500) {
                        var error = new ErrorRepresentation(data);
                        delay.reject(error);
                    }
                    else if (status === 400 || status === 422) {
                        var errorMap = new ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    }
                    else {
                        delay.reject(headers().warning);
                    }
                });

            return delay.promise;
        };

    });

}