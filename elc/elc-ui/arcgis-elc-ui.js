/*global define*/
define([
	"dojo/_base/declare",
	"dojo/Evented",
	"dojo/on",
	"esri/map",
	"esri/graphic",
	"esri/geometry/jsonUtils",
	"esri/layers/FeatureLayer",
	"esri/InfoTemplate",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/Color",
	"esri/renderers/UniqueValueRenderer",
	"elc/elc-ui/main",
	"elc"
], function (declare, Evented, on, esriMap, Graphic, geometryJsonUtils, FeatureLayer, InfoTemplate, SimpleMarkerSymbol, SimpleLineSymbol, Color, UniqueValueRenderer, ElcUI, Elc) {
	var elcUI, routeLocator, pointResultsLayer, lineResultsLayer;

	var wsdotLogoGreen = new Color([0, 123, 95]);
	var eventColor = new Color([255, 100, 100]);

	var routePointOutlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,255,255,0.8]), 2);
	var routePointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, routePointOutlineSymbol, wsdotLogoGreen);
	var eventPointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, eventLineSymbol, eventColor);
	var routeLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, wsdotLogoGreen, 3);
	var eventLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SHORTDOT, eventColor, 3);

	var pointRenderer = new UniqueValueRenderer(routePointSymbol, "IsEvent");
	var lineRenderer = new UniqueValueRenderer(routeLineSymbol, "IsEvent");

	pointRenderer.addValue({
		description: "Where the user clicked",
		label: "Event",
		symbol: eventPointSymbol,
		value: 1
	});

	pointRenderer.addValue({
		description: "Route location",
		label: "Route Location",
		symbol: routePointSymbol,
		value: 0
	});

	lineRenderer.addValue({
		description: "Where the user clicked",
		label: "Event",
		symbol: eventLineSymbol,
		value: 1
	});

	lineRenderer.addValue({
		description: "Route location",
		label: "Route Location",
		symbol: routeLineSymbol,
		value: 0
	});

	function RouteLocationGraphicSet(routeLocation) {
		var geometry, attributes, graphic;
		/** @member {?esri/Graphic} */
		this.routeFeature = null;
		/** @member {?esri/Graphic} */
		this.eventPointFeature = null;
		/** @member {?esri/Graphic} */
		this.connectorLineFeature = null;

		var spatialReference = { wkid: 3857 };

		if (routeLocation) {
			if (routeLocation.RouteGeometry) {
				if (!routeLocation.RouteGeometry.spatialReference) {
					routeLocation.RouteGeometry.spatialReference = spatialReference;
				}
				geometry = geometryJsonUtils.fromJson(routeLocation.RouteGeometry);
				attributes = routeLocation.toJSON();
				attributes.IsEvent = 0;
				delete attributes.RouteGeometry;
				delete attributes.EventPoint;
				graphic = new Graphic(geometry, null, attributes);
				this.routeFeature = graphic;
			}
			if (routeLocation.EventPoint) {
				if (!routeLocation.EventPoint.spatialReference) {
					routeLocation.EventPoint.spatialReference = spatialReference;
				}
				geometry = geometryJsonUtils.fromJson(routeLocation.EventPoint);
				attributes = routeLocation.toJSON();
				attributes.IsEvent = 1;
				delete attributes.RouteGeometry;
				delete attributes.EventPoint;
				graphic = new Graphic(geometry, null, attributes);
				this.eventPointFeature = graphic;
			}
			if (routeLocation.RouteGeometry && routeLocation.EventPoint) {
				geometry = geometryJsonUtils.fromJson({
					paths: [
						[
							[this.routeFeature.geometry.x, this.routeFeature.geometry.y],
							[this.eventPointFeature.geometry.x, this.eventPointFeature.geometry.y]
						]
					],
					spatialReference: spatialReference
				});
				attributes = routeLocation.toJSON();
				attributes.IsEvent = 1;
				delete attributes.RouteGeometry;
				delete attributes.EventPoint;
				graphic = new Graphic(geometry, null, attributes);
				this.connectorLineFeature = graphic;
			}
		}
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

	var ArcGisElcUI = declare(Evented, {
		constructor: function (domNode) {

			var self = this;

			/**
			 * Adds ELC results to feature layers.
			 */
			function addResultsToMap(elcResults) {
				var nonGraphics, graphics;
				if (elcResults && Array.isArray(elcResults)) {
					if (elcResults.length === 0) {
						self.emit("elc-results-not-found", { elcResults: elcResults });
					} else {
						pointResultsLayer.suspend();
						lineResultsLayer.suspend();
						nonGraphics = [];
						graphics = [];
						elcResults.forEach(function (routeLocation) {
							var gSet = new RouteLocationGraphicSet(routeLocation);
							if (gSet.routeFeature) {
								if (gSet.routeFeature.geometry.type === "point") {
									pointResultsLayer.add(gSet.routeFeature);
								} else if (gSet.routeFeature.geometry.type === "polyline") {
									lineResultsLayer.add(gSet.routeFeature);
								} else {
									console.warn("Unexpected geometry type", gSet.routeFeature);
								}
								graphics.push(gSet.routeFeature);
							} else {
								nonGraphics.push(routeLocation);
							}
							if (gSet.eventPointFeature) {
								pointResultsLayer.add(gSet.eventPointFeature);
							}
							if (gSet.connectorLineFeature) {
								lineResultsLayer.add(gSet.connectorLineFeature);
							}
							////if (routeLocation.RouteGeometry) {
							////	graphic = routeLocationToGraphic(routeLocation);
							////	if (graphic) {
							////		if (graphic.geometry.type === "point") {
							////			pointResultsLayer.add(graphic);
							////		} else if (graphic.geometry.type === "polyline") {
							////			lineResultsLayer.add(graphic);
							////		} else {
							////			console.warn("Unexpected geometry type", graphic);
							////		}
							////	}
							////	graphics.push(graphic);
							////} else {
							////	nonGraphics.push(routeLocation);
							////}
						});
						pointResultsLayer.resume();
						lineResultsLayer.resume();
						self.emit("elc-results-found", {
							elcResults: elcResults,
							graphics: graphics
						});
					}
				}
				if (nonGraphics && nonGraphics.length > 0) {
					self.emit("non-geometry-results-returned", {
						elcResults: elcResults,
						nonGeometryResults: nonGraphics
					});
				}
			}

			routeLocator = new Elc.RouteLocator();

			elcUI = new ElcUI(domNode);

			elcUI.root.addEventListener('find-route-location-submit', function (e) {
				var locations = [new Elc.RouteLocation(e.detail)];
				routeLocator.findRouteLocations({
					locations: locations,
					outSR: 3857
				}).then(addResultsToMap, function (error) {
					console.error("find route location error", error);
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
						referenceDate: new Date()
					}).then(function (elcResults) {
						elcResults = elcResults.map(function (r) {
							r = r.toJSON();
							delete r.Coordinates;
							delete r.Angle;
							delete r.RouteGeometry;
							delete r.RealignmentDate;
							delete r.ArmCalcReturnCode;
							delete r.ArmCalcReturnMessage;
							//delete r.EventPoint;
							return new Elc.RouteLocation(r);
						});
						routeLocator.findRouteLocations({
							locations: elcResults,
							outSR: 3857
						}).then(addResultsToMap, function (error) {
							console.error("find route location error", error);
						});
						////addResultsToMap(elcResults).then(addResultsToMap);
					}, function (error) {
						console.error("find nearest route location error", error);
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
					{ name: "IsEvent", type: "esriFieldTypeSmallInteger", alias: "Is Event"}
			];

			lineResultsLayer = new FeatureLayer({
				featureSet: null,
				layerDefinition: {
					geometryType: "esriGeometryPolyline",
					fields: elcFields
				}
			}, {
				id: "Located Segment",
				infoTemplate: infoTemplate
			});
			lineResultsLayer.setRenderer(lineRenderer);



			pointResultsLayer = new FeatureLayer({
				featureSet: null,
				layerDefinition: {
					geometryType: "esriGeometryPoint",
					fields: elcFields
				}
			}, {
				id: "Located Milepost",
				infoTemplate: infoTemplate
			});

			pointResultsLayer.setRenderer(pointRenderer);

			this._layers = {
				pointResults: pointResultsLayer,
				lineResults: lineResultsLayer
			};

			var clearBtn = document.querySelector(".clear-graphics-button");
			clearBtn.addEventListener("click", function () {
				pointResultsLayer.clear();
				lineResultsLayer.clear();
			});
		},
		setMap: function (map) {
			map.addLayer(this._layers.lineResults);
			map.addLayer(this._layers.pointResults);
			this.map = map;
		}
	});

	return ArcGisElcUI;
});