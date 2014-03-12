/*global elc*/
var routeLocator = new elc.RouteLocator();
routeLocator.getRouteList(function (list) {
	console.debug(list);
});

routeLocator.findRouteLocations({
	locations: [
		new elc.RouteLocation({
			Route: "005",
			Arm: 0,
		})
	],
	referenceDate: new Date("12/31/2013"),
	successHandler: function (routeLocations) {
		console.log(routeLocations);
	}
});

routeLocator.findNearestRouteLocations({
	//useCors: useCors,
	coordinates: [1083893.182, 111526.885],
	referenceDate: new Date("12/31/2011"),
	searchRadius: 1,
	inSR: 2927,
	successHandler: function (data) {
		console.log(data);
	},
	errorHandler: function (error) {
		console.error(error);
	}
});
