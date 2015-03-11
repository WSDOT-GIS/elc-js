/*global require*/
require(["esri/map", "elc-ui"], function (esriMap, ElcUI) {
	var map, elcUI;

	elcUI = new ElcUI(document.getElementById("elcUI"));

	elcUI.root.addEventListener('find-route-location-submit', function (e) {
		console.log(e.detail);
	});

	map = new esriMap("map", {
		basemap: "gray",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});
});