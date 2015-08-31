/*global define,module */
// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Route = factory();
    }
}(this, function () {

    "use strict";

    /** 
     * Route is increase only.
     * @constant 
     * @type{number}
     * @default 1
     * 
     */
    var ROUTE_TYPE_INCREASE = 1;
    /** 
     * Route is decrease only
     * @constant
     * @type{number}
     * @default 2
     */
    var ROUTE_TYPE_DECREASE = 2;
    /** 
     * Route is both increase and decrease.
     * @constant
     * @type{number}
     * @default 3 ({@link ROUTE_TYPE_INCREASE} | {@link ROUTE_TYPE_DECREASE} )
     */
    var ROUTE_TYPE_BOTH = 3;
    /** 
     * Route is a ramp.
     * @constant
     * @type{number}
     * @default 4
     */
    var ROUTE_TYPE_RAMP = 4;

    /**
     * Represents a state route.
     * @param {string} name The name of the route.
     * @param {number} lrsTypes An integer from 1 to 4, corresponding to one of the following constants:
     *		{@link ROUTE_TYPE_INCREASE},
     *		{@link ROUTE_TYPE_DECREASE},
     *		{@link ROUTE_TYPE_BOTH},
     *		{@link ROUTE_TYPE_RAMP}	 
     * @property {string} name The name of the route.
     * @property {number} lrsTypes An integer from 1 to 4, corresponding to one of the following constants:
     *		{@link ROUTE_TYPE_INCREASE},
     *		{@link ROUTE_TYPE_DECREASE},
     *		{@link ROUTE_TYPE_BOTH},
     *		{@link ROUTE_TYPE_RAMP}
     * @memberof $.wsdot.elc
     * @class
     **/
    function Route(name, lrsTypes) {
        this.name = name;
        this.lrsTypes = lrsTypes;
    }

    /**
     * Returns a boolean value indicating whether the route is increase.
     * @return {boolean} Returns true if {@link Route#lrsTypes} equals 
     * {@link ROUTE_TYPE_INCREASE} or {@link ROUTE_TYPE_BOTH}.
     */
    Route.prototype.isIncrease = function () {
        return this.lrsTypes === ROUTE_TYPE_INCREASE || this.lrsTypes === ROUTE_TYPE_BOTH;
    };

    /**
     * Returns a boolean value indicating whether the route is decrease.
     * @return {boolean} Returns true if {@link Route#lrsTypes} equals 
     * {@link ROUTE_TYPE_DECREASE} or {@link ROUTE_TYPE_BOTH}.
     */
    Route.prototype.isDecrease = function () {
        return this.lrsTypes === ROUTE_TYPE_DECREASE || this.lrsTypes === ROUTE_TYPE_BOTH;
    };

    /**
     * Returns a boolean value indicating whether the route is both increase and decrease.
     * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link ROUTE_TYPE_BOTH}.
     */
    Route.prototype.isBoth = function () {
        return this.lrsTypes === ROUTE_TYPE_BOTH;
    };

    /**
     * Returns a boolean value indicating whether the route is a ramp.
     * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link ROUTE_TYPE_RAMP}
     */
    Route.prototype.isRamp = function () {
        return this.lrsTypes === ROUTE_TYPE_RAMP;
    };

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return Route;
}));