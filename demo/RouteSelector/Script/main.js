/*global require*/

require.config({
    paths: {
        elc: "../../.."
    }
});

require(["elc/elc-ui/RouteSelector", "elc/RouteLocator"], function (RouteSelector, RouteLocator) {
    var routeSelector = new RouteSelector(document.getElementById("routeSelector"));

    var routeLocator = new RouteLocator();
    routeLocator.getRouteList().then(function (routeList) {
        console.debug("routeList", routeList);
        routeSelector.routes = routeList.Current;
    }, function (error) {
        console.error(error);
    });
});