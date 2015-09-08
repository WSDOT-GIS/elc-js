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
        root.RouteId = factory();
    }
}(this, function () {

    "use strict";

    var routeRe;

    /**
     * Matches a state route ID.  Regex.exec will return an array with four elements: the entire route name, SR, RRT, and RRQ 
     * @author Jeff Jacobson
     */
    routeRe = /^(\d{3})(?:((?:AR)|(?:[CH][DI])|(?:C[O])|(?:F[DI])|(?:LX)|(?:[PQRS][\dU])|(?:RL)|(?:SP)|(?:TB)|(?:TR)|(?:PR)|(?:F[UST])|(?:ML)|(?:UC))([A-Z0-9]{0,6}))?$/i;
    /*
    ==RRTs (Related Roadway Type)==
    AR Alternate Route 
    CD Collector Distributor (Dec)
    CI Collector Distributor (Inc)
    CO Couplet 
    FI Frontage Road (Inc) 
    FD Frontage Road (Dec) 
    LX Crossroad within Interchange
    RL Reversible Lane 
    SP Spur 
    TB Transitional Turnback 
    TR Temporary Route 
    PR Proposed Route 

    UC Under Construction
    
    ===Ramps===
    P1 - P9 Off Ramp (Inc)
    PU Extension of P ramp
    Q1 - Q9 On Ramp (Inc)
    QU Extension of Q ramp
    R1 - R9 Off Ramp (Dec)
    RU Extension of R ramp
    S1 - S9 On Ramp (Dec)
    SU Extension of S ramp
    
    ==Ferries==
    FS Ferry Ship (Boat) 
    FT Ferry Terminal 

    */

    var rrtDefinitions = {
        "AR": "Alternate Route",    
        "CD": "Collector Distributor (Dec)",
        "CO": "Couplet",    
        "CI": "Collector Distributor (Inc)",
        "FI": "Frontage Road (Inc)",    
        "FD": "Frontage Road (Dec)",
        "LX": "Crossroad within Interchange",
        "RL": "Reversible Lane",
        "SP": "Spur",    
        "TB": "Transitional Turnback",
        "TR": "Temporary Route",
        "PR": "Proposed Route",
        "FS": "Ferry Ship (Boat)",
        "FT": "Ferry Terminal",
        "UC": "Under Construction",
        "HI": "Grade-Separated HOV (Inc)",
        "HD": "Grade-Separated HOV (Dec)"
    };

    (function () {
        var rampTypes = {
            "P": "Off Ramp (Inc)",
            "Q": "On Ramp (Inc)",
            "R": "Off Ramp (Dec)",
            "S": "On Ramp (Dec)"
        };

        var key, i, l, newKey, desc;
        for (key in rampTypes) {
            if (rampTypes.hasOwnProperty(key)) {
                desc = rampTypes[key];
                for (i = 1, l = 10; i < l; i += 1) {
                    newKey = [key, i].join("");
                    rrtDefinitions[newKey] = [desc, i].join(" ");
                }
                newKey = key + "U";
                rrtDefinitions[newKey] = ["Extension of", key, "ramp"].join(" ");
            }
        }
    }());

    /**
     * Splits a state route ID into SR, RRT, RRQ components.
     */
    function RouteId(routeId) {
        var match = routeId.match(routeRe);

        if (!match) {
            throw new Error("Invalid route ID");
        }

        var _sr, _rrt, _rrq;

        _sr = match[1];
        _rrt = match[2] || null;
        _rrq = match[3] || null;

        Object.defineProperties(this, {
            /**@member {string}*/
            sr: {
                get: function () {
                    return _sr;
                }
            },
            /**@member {?string} */
            rrt: {
                get: function () {
                    return _rrt;
                }
            },
            /**@member {?string} */
            rrq: {
                get: function () {
                    return _rrq;
                }
            },
            /**@member {?string} */
            rrtDescription: {
                get: function () {
                    return _rrt ? rrtDefinitions[_rrt] : null;
                }
            },
            /** 
             * @member {?Number} - The milepost on the mainline route where this route attaches. 
             * Will be null if the RRQ is non-numeric.
             */
            mainlineIntersectionMP: {
                get: function () {
                    var i = null;
                    if (_rrq && /^\d+$/.test(_rrq)) {
                        i = parseInt(_rrq, 10);
                        i = i / 100;
                    }
                    return i;
                }
            },
            rrqDescription: {
                get: function () {
                    var n = this.mainlineIntersectionMP;
                    if (n !== null) {
                        return " @ MP " + n;
                    } else {
                        return null;
                    }
                }
            },
            description: {
                get: function () {
                    var label;
                    if (!_rrt){
                        label = [_sr, "Mainline"].join(" ");
                    } else if (!_rrq) {
                        label = [_sr, this.rrtDescription].join(" ");
                    } else if (this.mainlineIntersectionMP !== null) {
                        label = [_sr, this.rrtDescription, "@ MP", this.mainlineIntersectionMP].join(" ");
                    } else {
                        label = [_sr, this.rrtDescription, _rrq].join(" ");
                    }

                    return label
                }
            }
        });
    }

    RouteId.prototype.toString = function () {
        var output = [this.sr];
        if (this.rrt) {
            output.push(this.rrt);
            if (this.rrq) {
                output.push(this.rrq);
            }
        }
        return output.join("");
    };

    RouteId.routeRe = routeRe;

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return RouteId;
}));