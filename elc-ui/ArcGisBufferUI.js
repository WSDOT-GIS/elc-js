/*global define*/
define([
	"dojo/on",
	"esri/map",
	"esri/graphic",
	"esri/geometry/jsonUtils",
	"esri/layers/FeatureLayer",
	"esri/InfoTemplate",
	"elc-ui",
	"elc"
], function (on, esriMap, Graphic, geometryJsonUtils, FeatureLayer, InfoTemplate, ElcUI, Elc) {
	var elcUI, routeLocator, pointResultsLayer, lineResultsLayer;

	/**
	 * Converts an ELC RouteLocation object into an ArcGIS JS API Graphic.
	 * @param {Elc.RouteLocation} routeLocation
	 * @returns {esri/Graphic}
	 */
	function routeLocationToGraphic(routeLocation) {
		var graphic, geometry, attributes;
		if (routeLocation) {
			geometry = geometryJsonUtils.fromJson(routeLocation.RouteGeometry);
			attributes = routeLocation.toJSON();
			delete attributes.RouteGeometry;
			delete attributes.EventPoint;
			graphic = new Graphic(geometry, null, attributes);
		}
		return graphic;
	}

	/**
	 * Creates popup content from graphic attributes.
	 * @param {esri/Graphic} graphic
	 * @returns {HTMLDListElement}
	 */
	function graphicToHtml(graphic) {
		var dl = document.createElement("dl"), dt, dd, v;
		var layer = graphic._layer;

		layer.fields.forEach(function (field) {
			if (graphic.attributes.hasOwnProperty(field.name)) {
				v = graphic.attributes[field.name];
				if (v || (v === 0 && !/Code$/i.test(field.name))) {
					dt = document.createElement("dt");
					dt.textContent = field.alias || field.name;
					dd = document.createElement("dd");
					dd.textContent = v;
					dl.appendChild(dt);
					dl.appendChild(dd);
				}
			}
		});
		return dl;
	}

	function ArcGisBufferUI(domNode) {

		var self = this;

		/**
		 * Adds ELC results to feature layers.
		 */
		function addResultsToMap(elcResults) {
			if (elcResults && Array.isArray(elcResults)) {
				pointResultsLayer.suspend();
				lineResultsLayer.suspend();
				elcResults.forEach(function (routeLocation) {
					var graphic = routeLocationToGraphic(routeLocation);
					if (graphic) {
						if (graphic.geometry.type === "point") {
							pointResultsLayer.add(graphic);
						} else if (graphic.geometry.type === "polyline") {
							lineResultsLayer.add(graphic);
						} else {
							console.warn("Unexpected geometry type", graphic);
						}
					}
				});
				pointResultsLayer.resume();
				lineResultsLayer.resume();
			}
		}

		routeLocator = new Elc.RouteLocator();

		elcUI = new ElcUI(domNode);

		elcUI.root.addEventListener('find-route-location-submit', function (e) {
			var locations = [new Elc.RouteLocation(e.detail)];
			routeLocator.findRouteLocations({
				locations: locations,
				outSR: 3857,
				successHandler: addResultsToMap,
				errorHandler: function (error) {
					console.error("find route location error", error);
				}
			});
		});

		elcUI.root.addEventListener('find-nearest-route-location-submit', function (e) {
			// Setup map click event. This should only occur ONCE.
			on.once(self.map, "click", function (mapEvt) {
				var mapPoint = mapEvt.mapPoint;
				routeLocator.findNearestRouteLocations({
					coordinates: [mapPoint.x, mapPoint.y],
					searchRadius: e.detail.radius,
					inSR: mapPoint.spatialReference.wkid,
					outSR: mapPoint.spatialReference.wkid,
					referenceDate: new Date(),
					successHandler: addResultsToMap,
					errorHandler: function (error) {
						console.error(error);
					}
				});
			});
		});

		var infoTemplate = new InfoTemplate("Route Location", graphicToHtml);

		var elcFields = [
				{ name: "Id", type: "esriFieldTypeInteger", alias: "ID" },
				{ name: "Route", type: "esriFieldTypeString" },
				{ name: "Decrease", type: "esriFieldTypeSmallInteger" },
				{ name: "Arm", type: "esriFieldTypeDouble", alias: "ARM" },
				{ name: "Srmp", type: "esriFieldTypeDouble", alias: "SRMP" },
				{ name: "Back", type: "esriFieldTypeSmallInteger" },
				{ name: "ReferenceDate", type: "esriFieldTypeDate", alias: "Reference Date" },
				{ name: "ResponseDate", type: "esriFieldTypeDate", alias: "Response Date" },
				{ name: "RealignmentDate", type: "esriFieldTypeDate", alias: "Realignment Date" },
				{ name: "EndArm", type: "esriFieldTypeDouble", alias: "End ARM" },
				{ name: "EndSrmp", type: "esriFieldTypeDouble", alias: "End SRMP" },
				{ name: "EndBack", type: "esriFieldTypeSmallInteger", alias: "End Back" },
				{ name: "EndReferenceDate", type: "esriFieldTypeDate", alias: "End Reference Date" },
				{ name: "EndResponseDate", type: "esriFieldTypeDate", alias: "End Response Date" },
				{ name: "EndRealignDate", type: "esriFieldTypeDate", alias: "End Realignment Date" },
				{ name: "ArmCalcReturnCode", type: "esriFieldTypeInteger", alias: "ArmCalc Return Code" },
				{ name: "ArmCalcEndReturnCode", type: "esriFieldTypeInteger", alias: "ArmCalc End Return Code" },
				{ name: "ArmCalcReturnMessage", type: "esriFieldTypeString", alias: "ArmCalc Return Message" },
				{ name: "ArmCalcEndReturnMessage", type: "esriFieldTypeString", alias: "ArmCalc End Return Message" },
				{ name: "LocatingError", type: "esriFieldTypeString", alias: "Locating Error" },
				//{ name: "RouteGeometry", type: "esriFieldTypeGeometry" },
				//{ name: "EventPoint", type: "esriFieldTypeGeometry" },
				{ name: "Distance", type: "esriFieldTypeDouble" },
				{ name: "Angle", type: "esriFieldTypeDouble" },
		];

		lineResultsLayer = new FeatureLayer({
			featureSet: null,
			layerDefinition: {
				geometryType: "esriGeometryPolyline",
				fields: elcFields
			}
		}, {
			id: "ElcLineResults",
			infoTemplate: infoTemplate
		});

		pointResultsLayer = new FeatureLayer({
			featureSet: null,
			layerDefinition: {
				geometryType: "esriGeometryPoint",
				fields: elcFields
			}
		}, {
			id: "ElcPointResults",
			infoTemplate: infoTemplate
		});

		this._layers = {
			pointResults: pointResultsLayer,
			lineResults: lineResultsLayer
		};

		var clearBtn = document.querySelector(".clear-graphics-button");
		clearBtn.addEventListener("click", function () {
			pointResultsLayer.clear();
			lineResultsLayer.clear();
		});
	}

	ArcGisBufferUI.prototype.setMap = function (map) {
		map.addLayer(this._layers.lineResults);
		map.addLayer(this._layers.pointResults);
		this.map = map;
	};

	return ArcGisBufferUI;
});