/*global define,module*/
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
        root.elc = factory();
    }
}(this, function () {

    /**
     * 
     * @param {HTMLElement} root
     */
    function RouteSelector(root) {
        if (!(root && root instanceof HTMLElement)) {
            throw new TypeError("No root element provided or not an HTML element");
        }

        var _routes = null;

        var srSelect = document.createElement("select");
        srSelect.name = "SR";
        var rrtSelect = document.createElement("select");
        rrtSelect.name = "RRT";
        var rrqSelect = document.createElement("select");
        rrqSelect.name = "RRQ";

        root.appendChild(srSelect);
        root.appendChild(rrtSelect);
        root.appendChild(rrqSelect);

        Object.defineProperties(this, {
            routes: {
                get: function () {
                    return _routes;
                },
                set: function (routesArray) {
                    _routes = routesArray;

                    var docFrag = document.createDocumentFragment();

                    // Populate the SR Select.
                    var route, i, l, option;
                    for (i = 0, l = routesArray.length; i < l; i += 1) {
                        route = routesArray[i];
                        if (route.name && route.name.length === 3) {
                            option = document.createElement("option");
                            option.label = parseInt(route.name);
                            option.value = route.name;
                            docFrag.appendChild(option);
                        }
                    }

                    srSelect.appendChild(docFrag);
                }
            }
        });
    }



    return RouteSelector;
}));