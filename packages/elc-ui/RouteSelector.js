﻿/*global define,module, require*/
// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["../Route", "../RouteId"], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("Route", "RouteId"));
    } else {
        // Browser globals (root is window)
        root.elc = factory(root.Route, root.RouteId);
    }
}(this, function () {

    /**
     * Creates a Route Selector UI control.
     * @param {HTMLElement} root
     */
    function RouteSelector(root) {
        if (!(root && root instanceof HTMLElement)) {
            throw new TypeError("No root element provided or not an HTML element");
        }

        root.classList.add("route-selector");

        var _routes = null;

        var mainlineSelect = document.createElement("select");
        var routeSelect = document.createElement("select");
        routeSelect.name = "route";
        routeSelect.required = true;
        // for bootstrap
        mainlineSelect.classList.add("form-control");
        routeSelect.classList.add("form-control");

        var cbLabel = document.createElement("label");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "decrease";
        cbLabel.appendChild(checkbox);
        cbLabel.appendChild(document.createTextNode(" Decrease"));
        cbLabel.classList.add("input-group-addon");

        root.appendChild(mainlineSelect);
        root.appendChild(routeSelect);
        root.appendChild(cbLabel);

        Object.defineProperties(this, {
            /**@property {HTMLElement}*/
            root: {
                get: function () {
                    return root;
                }
            },
            /**@property {Route[]}*/
            routes: {
                get: function () {
                    return _routes;
                },
                set: function (routesArray) {
                    _routes = routesArray;
                    _routes.sort(function (a, b) {
                        if (a.name === b.name) {
                            return 0;
                        } else if (a.name < b.name) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });

                    var srDocFrag = document.createDocumentFragment();

                    // Populate the SR Select.
                    var route, i, l, option;
                    for (i = 0, l = routesArray.length; i < l; i += 1) {
                        route = routesArray[i];
                        if (route.name) {
                            if (route.name.length === 3) {
                                option = document.createElement("option");
                                option.label = route.name;
                                option.value = route.name;
                                option.dataset.isBoth = route.isBoth;
                                srDocFrag.appendChild(option);
                            }
                        }
                    }

                    mainlineSelect.appendChild(srDocFrag);
                    addOptionsForCurrentlySelectedMainline();
                    setRouteDirectionControls();
                }
            }
        });

        /**
         * Populates the route box with options associated with the currently selected mainline.
         */
        function addOptionsForCurrentlySelectedMainline() {
            var mainline = mainlineSelect.value;
            // Remove options.
            routeSelect.innerHTML = "";

            var rampGroup = document.createElement("optgroup");
            rampGroup.label = "Ramps";

            var docFrag = document.createDocumentFragment();
            var route, option, srRe = /^\d{3}\s/, label;
            for (var i = 0, l = _routes.length; i < l; i += 1) {
                route = _routes[i];
                if (route.routeId.sr === mainline) {
                    option = document.createElement("option");
                    option.value = route.name;
                    label = route.routeId.description;
                    option.label = label.replace(srRe, "");
                    option.dataset.isBoth = route.isBoth;
                    if (route.isRamp) {
                        rampGroup.appendChild(option);
                    } else {
                        docFrag.appendChild(option);
                    }
                    if (rampGroup.children.length > 0) {
                        docFrag.appendChild(rampGroup);
                    }
                }
            }

            routeSelect.appendChild(docFrag);

        }

        function setRouteDirectionControls() {
            var option = routeSelect.options[routeSelect.selectedIndex];
            if (option.dataset.isBoth === "true") {
                checkbox.removeAttribute("disabled");
                root.classList.add("direction-both");
            } else {
                root.classList.remove("direction-both");
                checkbox.setAttribute("disabled", "disabled");

            }
        }

        mainlineSelect.addEventListener("change", addOptionsForCurrentlySelectedMainline, true);

        routeSelect.addEventListener("change", setRouteDirectionControls);
    }

    return RouteSelector;
}));