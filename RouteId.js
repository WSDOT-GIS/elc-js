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
    routeRe = /^(\d{3})(?:((?:AR)|(?:C[DI])|(?:C[O])|(?:F[DI])|(?:LX)|(?:[PQRS][\dU])|(?:RL)|(?:SP)|(?:TB)|(?:TR)|(?:PR)|(?:F[ST])|(?:ML))([A-Z0-9]{0,6}))?$/i; ///^(\d{3})(?:([A-Za-z0-9]{2})([A-Za-z0-9]{0,6}))?$/i;
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

    /**
     * Splits a state route ID into SR, RRT, RRQ components.
     */
    function RouteId(routeId) {
        var match = routeId.match(routeRe);

        if (!match) {
            throw new Error("Invalid route ID");
        }

        /**@member {string}*/
        this.sr = match[1];
        /**@member {?string} */
        this.rrt = match[2] || null;
        /**@member {?string} */
        this.rrq = match[3] || null;
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