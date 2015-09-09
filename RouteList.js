/*global define,module,require */
// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["./Route"], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("Route"));
    } else {
        // Browser globals (root is window)
        root.RouteList = factory(root.Route);
    }
}(this, function (Route) {

    "use strict";

    /**
     * Represents the list of routes returned from the ELC's routes resource.  The properties of this class will be the same as the LRS years
     * of the map service.  The values of these properties are arrays of {@link Route} objects.
     * @class Represents the list of routes returned from the ELC's routes resource.  The properties of this class will be the same as the LRS years
     * of the map service.  The values of these properties are arrays of {@link Route} objects.
     * @param {object} data The JSON data returned from the ELC's "routes" resource.
     * @memberof $.wsdot.elc
     */
    function RouteList(data) {
        var year, routes, route, routeObj;

        for (year in data) {
            if (data.hasOwnProperty(year)) {
                routes = [];
                for (route in data[year]) {
                    if (data[year].hasOwnProperty(route)) {
                        try {
                            routeObj = new Route(route, data[year][route]);
                        } catch (e) {
                            console.warn("Error creating route: '" + route + "', " + year, e);
                            routeObj = null;
                        }

                        if (routeObj) {
                            routes.push(routeObj);
                        }
                    }
                }
                this[year] = routes;
            }
        }
    }

    /**
     * Gets a sorted list of the LRS years.
     * @return {Array} An array of LRS year strings.
     */
    RouteList.prototype.getYearList = function () {
        var year, output = [];
        for (year in this) {
            if (this.hasOwnProperty(year)) {
                output.push(year);
            }
        }

        output.sort();

        return output;
    };

    RouteList.prototype.getRouteTree = function (year) {
        var routeArray = this[year];
        var routeTree = {};
        routeArray.forEach(function (route) {
            var routeId, sr, rrt, rrq;
            routeId = route.routeId;
            sr = routeId.sr;
            rrt = routeId.rrt;
            rrq = routeId.rrq;

            if (!routeTree[sr]) {
                routeTree[sr] = {};
            }
        });
    };




    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return RouteList;
}));