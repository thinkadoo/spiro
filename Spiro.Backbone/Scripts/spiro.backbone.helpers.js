var Spiro;
(function (Spiro) {
    //Copyright 2013 Naked Objects Group Ltd
    //Licensed under the Apache License, Version 2.0(the "License");
    //you may not use this file except in compliance with the License.
    //You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
    //Unless required by applicable law or agreed to in writing, software
    //distributed under the License is distributed on an "AS IS" BASIS,
    //WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    //See the License for the specific language governing permissions and
    //limitations under the License.
    /// <reference path="typings/jquery/jquery.d.ts" />
    /// <reference path="typings/backbone/backbone.d.ts" />
    /// <reference path="spiro.models.ts" />
    //declare var _: any;
    // helpers for common tasks with spiro model
    (function (Helpers) {
        function createActionInvoke(domainObject, actionName, method) {
            var action = domainObject.actionMembers()[actionName];
            return createUrlInvoke(action.links().linkByRel("urn:org.restfulobjects:rels/details").href() + "/invoke", method);
        }
        Helpers.createActionInvoke = createActionInvoke;

        function createUrlInvoke(url, method) {
            var result = new Spiro.ActionResultRepresentation();
            result.hateoasUrl = url;
            result.method = method || "POST";
            return result;
        }
        Helpers.createUrlInvoke = createUrlInvoke;

        function persist(domainObject, members, options) {
            var map = domainObject.getPersistMap();
            for (var m in members || {}) {
                map.setMember(m, new Spiro.Value(members[m]));
            }
            map.save(options);
        }
        Helpers.persist = persist;

        function invokeAction(domainObject, actionName, parameters, options) {
            var actionInvoke = createActionInvoke(domainObject, actionName);
            invoke(actionInvoke, parameters, options);
        }
        Helpers.invokeAction = invokeAction;

        function invoke(invoke, parameters, options) {
            invoke.attributes = {};

            for (var p in parameters || {}) {
                invoke.setParameter(p, new Spiro.Value(parameters[p]));
            }

            invoke.fetch(options);
        }
        Helpers.invoke = invoke;
    })(Spiro.Helpers || (Spiro.Helpers = {}));
    var Helpers = Spiro.Helpers;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.backbone.helpers.js.map
