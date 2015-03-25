/*global require*/
require([
	"esri/map",
	"elc",
	"elc/elc-ui/arcgis-elc-ui"
], function (esriMap, elc, arcgisElcUi) {
	var map, elcUI;

	elcUI = new arcgisElcUi(document.getElementById("elcUI"));

	elcUI.on("elc-results-not-found", function () {
		alert("No results found");
	});

	elcUI.on("non-geometry-results-returned", function (e) {
		console.log("non geometry results found", e);
	});

	elcUI.on("elc-results-found", function (e) {
		var point;
		if (e && e.graphics && e.graphics.length > 0) {
			point = e.graphics[0].geometry;
			map.infoWindow.show(point);
			map.centerAt(point);
			map.infoWindow.setFeatures(e.graphics);
		}
	});

	map = new esriMap("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", function () {
		elcUI.setMap(map);
	});

});