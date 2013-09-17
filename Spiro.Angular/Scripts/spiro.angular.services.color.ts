/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />


module Spiro.Angular {

    interface ColourMapItemInterface {
        [index: string]: string;
    }

    interface ColourMapInterface {
        [index: string]: ColourMapItemInterface;
    }

    declare var colourMap: ColourMapInterface;
    declare var defaultColourArray: ColourMapItemInterface[];
    declare var defaultColour: ColourMapItemInterface;

    export interface IColor {
        toColorFromHref(href: string)
        toColorFromType(type);
    }

    app.service('Color', function () {

        var color = <IColor>this;

        function hashCode(toHash) {
            var hash = 0, i, char;
            if (toHash.length == 0) return hash;
            for (i = 0; i < toHash.length; i++) {
                char = toHash.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        };

        function getColourMapValues(dt: string) {
            var map = dt ? colourMap[dt] : defaultColour;
            if (!map) {
                var hash = Math.abs(hashCode(dt));
                var index = hash % 18;
                map = defaultColourArray[index];
                colourMap[dt] = map;
            }
            return map;
        }

        function typeFromUrl(url: string): string {
            var typeRegex = /(objects|services)\/([\w|\.]+)/;
            var results = (typeRegex).exec(url);
            return (results && results.length > 2) ? results[2] : "";
        }

        color.toColorFromHref = function (href: string) {
            var type = typeFromUrl(href);
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }

        color.toColorFromType = function (type) {
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }
    });
}