var Spiro;
(function (Spiro) {
    /// <reference path="typings/underscore/underscore.d.ts" />
    /// <reference path="spiro.models.ts" />
    /// <reference path="spiro.angular.viewmodels.ts" />
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        Angular.app.service('Color', function () {
            var color = this;

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

            color.toColorFromHref = function (href) {
                var type = typeFromUrl(href);
                return "bg-color-" + getColourMapValues(type)["backgroundColor"];
            };

            color.toColorFromType = function (type) {
                return "bg-color-" + getColourMapValues(type)["backgroundColor"];
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.services.color.js.map
