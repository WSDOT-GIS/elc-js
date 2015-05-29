/*global require*/
require([
	"esri/map",
	"elc",
	"elc/elc-ui/ArcGisElcUI"
], function (esriMap, elc, arcgisElcUi) {
	var map, elcUI;

	elcUI = new arcgisElcUi(document.getElementById("elcUI"), { bootstrap: true });

	elcUI.on("elc-results-not-found", function () {
		alert("No results found");
	});

	elcUI.on("non-geometry-results-returned", function (e) {
		console.log("non geometry results found", e);
		var elcResult = e.elcResults[0];
		var output = [];
		var properties = [
			"LocatingError",
			"ArmCalcReturnMessage",
			"ArmCalcEndReturnMessage"
		];
		properties.forEach(function (name) {
			if (elcResult[name]) {
				output.push([name, elcResult[name]].join(": "));
			}
		});
		output = output.join("\n");
		alert(output);
	});

	elcUI.on("elc-results-found", function (e) {
		var point;
		if (e && e.graphics && e.graphics.length > 0) {
			point = e.graphics[0].geometry;
			if (point.getPoint) {
				point = point.getPoint(0, 0);
			}
			map.infoWindow.show(point);
			map.centerAt(point);
			map.infoWindow.setFeatures(e.graphics);
		}
	});

	map = new esriMap("map", {
		basemap: "osm",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	map.on("load", function () {
		elcUI.setMap(map);
	});

});