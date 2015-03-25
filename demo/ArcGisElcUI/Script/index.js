/*global require*/
require([
	"esri/map",
	"elc-ui/arcgis-elc-ui"
], function (esriMap, arcgisElcUi) {
	var map, elcUI;

	elcUI = new arcgisElcUi(document.getElementById("elcUI"));

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