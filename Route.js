/*global define,module,require */

/**
 * A module representing a WSDOT route.
 * @module Route
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["./RouteId", "./lrsTypeUtils", "./routeTypeUtils"], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("RouteId", "lrsTypeUtils", "routeTypeUtils"));
    } else {
        // Browser globals (root is window)
        root.Route = factory(root.RouteId, root.lrsTypeUtils, root.routeTypeUtils);
    }
}(this, function (RouteId, lrsTypeUtils, routeTypeUtils) {

    "use strict";

    /**
     * Represents a state route.
     * @param {string} name - The name of the route.
     * @param {number} lrsTypesValue - An integer from 1 to 4, corresponding to one of the following constants:
     *      {@link lrsTypeUtils.LRS_TYPE_INCREASE},
     *      {@link lrsTypeUtils.LRS_TYPE_DECREASE},
     *      {@link lrsTypeUtils.LRS_TYPE_BOTH},
     *      {@link lrsTypeUtils.LRS_TYPE_RAMP}
     * @param {number} routeType -
     * @constructor
     * @alias module:Route
     **/
    function Route(name, lrsTypesValue, routeType) {
        var _name = name;
        var _lrsTypes = lrsTypeUtils.getLrsTypeValue(lrsTypesValue);
        /*jshint eqnull:true*/
        var _routeType = routeType != null ? routeTypeUtils.getRouteTypeValue(routeType) : null;
        /*jshint eqnull:false*/
        var _routeId = new RouteId(_name);

        Object.defineProperties(this, {
            /* @member {string} name The name of the route. */
            name: {
                get: function () {
                    return _name;
                }
            },
            /* @property {number} lrsTypes An integer from 1 to 4, corresponding to one of the following constants:
             *      {@link lrsTypeUtils.LRS_TYPE_INCREASE},
             *      {@link lrsTypeUtils.LRS_TYPE_DECREASE},
             *      {@link lrsTypeUtils.LRS_TYPE_BOTH},
             *      {@link lrsTypeUtils.LRS_TYPE_RAMP}
             */
            lrsTypes: {
                get: function () {
                    return _lrsTypes;
                }
            },
            routeType: {
                get: function() {
                    return _routeType;
                }
            },
            routeTypeAbbreviation: {
                get: function() {
                    return _routeType !== null ? routeTypeUtils.getRouteTypeAbbreviation(_routeType) : null;
                }
            },
            routeId: {
                get: function() {
                    return _routeId;
                }
            },
            /**
             * Returns a boolean value indicating whether the route is increase.
             * @return {boolean} Returns true if {@link Route#lrsTypes} equals 
             * {@link lrsTypeUtils.LRS_TYPE_INCREASE} or {@link lrsTypeUtils.LRS_TYPE_BOTH}.
             */
            isIncrease: {
                get: function () {
                    return _lrsTypes === lrsTypeUtils.LRS_TYPE_INCREASE || _lrsTypes === lrsTypeUtils.LRS_TYPE_BOTH;
                }
            },
            /**
             * Returns a boolean value indicating whether the route is decrease.
             * @return {boolean} Returns true if {@link Route#lrsTypes} equals 
             * {@link lrsTypeUtils.LRS_TYPE_DECREASE} or {@link lrsTypeUtils.LRS_TYPE_BOTH}.
             */
            isDecrease: {
                get: function () {
                    return _lrsTypes === lrsTypeUtils.LRS_TYPE_DECREASE || _lrsTypes === lrsTypeUtils.LRS_TYPE_BOTH;
                }
            },
            /**
             * Returns a boolean value indicating whether the route is both increase and decrease.
             * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link lrsTypeUtils.LRS_TYPE_BOTH}.
             */
            isBoth: {
                get: function () {
                    return _lrsTypes === lrsTypeUtils.LRS_TYPE_BOTH;
                }
            },
            /**
             * Returns a boolean value indicating whether the route is a ramp.
             * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link lrsTypeUtils.LRS_TYPE_RAMP}
             */
            isRamp: {
                get: function () {
                    return _lrsTypes === lrsTypeUtils.LRS_TYPE_RAMP;
                }
            }
        });
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return Route;
}));