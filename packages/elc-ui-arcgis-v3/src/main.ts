import { ElcUI, IElcUIOptions } from "@wsdot/elc-ui";
import declare = require("dojo/_base/declare");
import Evented = require("dojo/Evented");
import on = require("dojo/on");
import Color = require("esri/Color");
import geometryJsonUtils = require("esri/geometry/jsonUtils");
import Point = require("esri/geometry/Point");
import Graphic = require("esri/graphic");
import InfoTemplate = require("esri/InfoTemplate");
import FeatureLayer = require("esri/layers/FeatureLayer");
import esriMap = require("esri/map");
import UniqueValueRenderer = require("esri/renderers/UniqueValueRenderer");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import RouteLocator, { RouteId, RouteLocation } from "wsdot-elc";

const defaultInternalTestUrl =
  "https://www.wsdot.wa.gov/data/tools/geoportal/config/internal-rmec.json";

let insideWsdot: boolean | undefined;

/**
 * Tests a given URL to see if browser is running inside of the WSDOT network.
 * @param url A URL that is only accessible within WSDOT.
 */
export async function isInsideWsdot(url: string = defaultInternalTestUrl) {
  if (insideWsdot !== undefined) {
    return insideWsdot;
  } else {
    try {
      const response = await fetch(url, {
        method: "head",
      });
      insideWsdot = response.ok;
    } catch (err) {
      insideWsdot = false;
    }
    return insideWsdot;
  }
}

const wsdotLogoGreen = new Color([0, 123, 95]); // This is the same color as the WSDOT logo.
const eventColor = new Color([255, 100, 100]); // Color used to indicate where user has clicked as opposed to actual route location.

const routePointOutlineSymbol = new SimpleLineSymbol(
  SimpleLineSymbol.STYLE_SOLID,
  new Color([255, 255, 255, 0.8]),
  2
);
const routePointSymbol = new SimpleMarkerSymbol(
  SimpleMarkerSymbol.STYLE_SQUARE,
  12,
  routePointOutlineSymbol,
  wsdotLogoGreen
);
const routeLineSymbol = new SimpleLineSymbol(
  SimpleLineSymbol.STYLE_SOLID,
  wsdotLogoGreen,
  3
);
const eventLineSymbol = new SimpleLineSymbol(
  SimpleLineSymbol.STYLE_SHORTDOT,
  eventColor,
  3
);
const eventPointSymbol = new SimpleMarkerSymbol(
  SimpleMarkerSymbol.STYLE_CIRCLE,
  12,
  eventLineSymbol,
  eventColor
);

const pointRenderer = new UniqueValueRenderer(routePointSymbol, "IsEvent");
const lineRenderer = new UniqueValueRenderer(routeLineSymbol, "IsEvent");

pointRenderer.addValue({
  description: "Where the user clicked",
  label: "Event",
  symbol: eventPointSymbol,
  value: 1,
});

pointRenderer.addValue({
  description: "Route location",
  label: "Route Location",
  symbol: routePointSymbol,
  value: 0,
});

lineRenderer.addValue({
  description: "Where the user clicked",
  label: "Event",
  symbol: eventLineSymbol,
  value: 1,
});

lineRenderer.addValue({
  description: "Route location",
  label: "Route Location",
  symbol: routeLineSymbol,
  value: 0,
});

export class RouteLocationGraphicSet {
  /** @member {?esri/Graphic} Actual point or line segment on a route */
  public routeFeature?: Graphic;
  /** @member {?esri/Graphic} In a find nearest operation, where the user clicked. */
  public eventPointFeature?: Graphic;
  /** @member {?esri/Graphic} A line that connects the routeFeature to the eventPointFeature. */
  public connectorLineFeature?: Graphic;
  private _insideWsdot: boolean | undefined;
  public get insideWsdot() {
    if (this._insideWsdot !== undefined) {
      return new Promise<boolean>((resolve) => {
        resolve(this._insideWsdot as boolean);
      });
    } else {
      const promise = isInsideWsdot();
      promise.then((bool) => {
        this._insideWsdot = bool;
      });
      return promise;
    }
  }
  /**
   * A set of graphics for a route location.
   */
  constructor(routeLocation: RouteLocation) {
    const spatialReference = { wkid: 3857 };

    if (routeLocation) {
      if (routeLocation.RouteGeometry && !routeLocation.RouteGeometry.points) {
        if (!routeLocation.RouteGeometry.spatialReference) {
          routeLocation.RouteGeometry.spatialReference = spatialReference;
        }
        const geometry = geometryJsonUtils.fromJson(
          routeLocation.RouteGeometry
        );
        const attributes = routeLocation.toJSON();
        attributes.IsEvent = 0;
        delete attributes.RouteGeometry;
        delete attributes.EventPoint;
        const graphic = new Graphic(geometry, undefined, attributes);
        this.routeFeature = graphic;
      }
      if (routeLocation.EventPoint) {
        if (!routeLocation.EventPoint.spatialReference) {
          routeLocation.EventPoint.spatialReference = spatialReference;
        }
        const geometry = geometryJsonUtils.fromJson(routeLocation.EventPoint);
        const attributes = routeLocation.toJSON();
        attributes.IsEvent = 1;
        delete attributes.RouteGeometry;
        delete attributes.EventPoint;
        const graphic = new Graphic(geometry, undefined, attributes);
        this.eventPointFeature = graphic;
      }
      if (this.routeFeature && this.eventPointFeature) {
        const routePoint = this.routeFeature.geometry as Point;
        const eventPoint = this.eventPointFeature.geometry as Point;
        const geometry = geometryJsonUtils.fromJson({
          paths: [
            [
              [routePoint.x, routePoint.y],
              [eventPoint.x, eventPoint.y],
            ],
          ],
          spatialReference,
        });
        const attributes = routeLocation.toJSON();
        attributes.IsEvent = 1;
        delete attributes.RouteGeometry;
        delete attributes.EventPoint;
        const graphic = new Graphic(geometry, undefined, attributes);
        this.connectorLineFeature = graphic;
      }
    }
  }
}

/**
 * Creates popup content from graphic attributes.
 * @param {esri/Graphic} graphic
 * @returns {HTMLDListElement}
 */
function graphicToHtml(graphic: Graphic) {
  const frag = document.createDocumentFragment();

  const dl = document.createElement("dl");
  frag.appendChild(dl);
  const codeField = /Code$/i;
  const ignoredFields = /^IsEvent$/i;
  const layer = graphic.getLayer() as FeatureLayer;
  const distanceFieldRe = /^Distance$/i;
  let nFmt: Intl.NumberFormat | undefined;
  // Not all browsers support Internationalization API. Those browsers will just get an unformatted number.
  if (typeof Intl !== "undefined") {
    nFmt = new Intl.NumberFormat();
  }

  for (const field of layer.fields) {
    if (
      Object.prototype.hasOwnProperty.call(graphic.attributes, field.name) &&
      !ignoredFields.test(field.name)
    ) {
      const v = graphic.attributes[field.name];
      if (v || (v === 0 && !codeField.test(field.name))) {
        const dt = document.createElement("dt");
        dt.textContent = field.alias || field.name;
        const dd = document.createElement("dd");
        if (distanceFieldRe.test(field.name) && nFmt) {
          dd.textContent = [nFmt.format(v), "ft."].join(" ");
        } else {
          dd.textContent = v;
        }
        dl.appendChild(dt);
        dl.appendChild(dd);
      }
    }
  }

  isInsideWsdot().then((isInside) => {
    // Add SRView URL if user is inside WSDOT Intranet.
    const p = document.createElement("p");
    const a = document.createElement("a");
    const routeId = new RouteId(graphic.attributes.Route);
    let url =
      "http://srview3i.wsdot.loc/stateroute/picturelog/v3/client/SRview.Windows.Viewer.application";
    const params = {
      srnum: routeId.sr,
      rrt: routeId.rrt ? routeId.rrt : null,
      rrq: routeId.rrq ? routeId.rrq : null,
      dir: graphic.attributes.Decrease ? "D" : null,
      srmp: graphic.attributes.Srmp,
      back: graphic.attributes.Back,
    };

    const queryParts = [];
    for (const k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        const value = (params as any)[k];
        if (value !== null) {
          queryParts.push([k, value].join("="));
        }
      }
    }
    const query = queryParts.join("&");
    url = [url, query].join("?");

    a.href = url;
    a.target = "_blank";
    a.textContent = "SRView";
    a.setAttribute("class", "srview clickonce");

    p.appendChild(a);

    frag.appendChild(p);
  });

  return frag;
}

export interface IArcGisElcUIOptions extends IElcUIOptions {
  url?: string;
}

const ArcGisElcUI = declare(Evented as any, {
  constructor(domNode: HTMLElement, options?: IArcGisElcUIOptions) {
    /**
     * Adds ELC results to feature layers.
     */
    const addResultsToMap = (elcResults: RouteLocation[]) => {
      let nonGraphics: any[] | undefined;
      if (elcResults && Array.isArray(elcResults)) {
        if (elcResults.length === 0) {
          this.emit("elc-results-not-found", { elcResults });
        } else {
          pointResultsLayer.suspend();
          lineResultsLayer.suspend();
          nonGraphics = [];
          const graphics = new Array<Graphic>();

          for (const routeLocation of elcResults) {
            const gSet = new RouteLocationGraphicSet(routeLocation);
            if (gSet.routeFeature) {
              if (gSet.routeFeature.geometry.type === "point") {
                pointResultsLayer.add(gSet.routeFeature);
              } else if (gSet.routeFeature.geometry.type === "polyline") {
                lineResultsLayer.add(gSet.routeFeature);
              } else {
                throw new TypeError("Unexpected geometry type");
                // console.warn("Unexpected geometry type", gSet.routeFeature);
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
          }
          pointResultsLayer.resume();
          lineResultsLayer.resume();
          this.emit("elc-results-found", {
            elcResults,
            graphics,
          });
        }
      }
      if (nonGraphics && nonGraphics.length > 0) {
        this.emit("non-geometry-results-returned", {
          elcResults,
          nonGeometryResults: nonGraphics,
        });
      }
    };

    const routeLocator = new RouteLocator(
      options ? options.url || undefined : undefined
    );

    const elcUI = new ElcUI(domNode, options);

    routeLocator.getRouteList().then(
      (routeList) => {
        if (routeList) {
          elcUI.routes = routeList.Current;
        }
      },
      (error) => {
        throw error;
      }
    );

    elcUI.root.addEventListener(
      "find-route-location-submit",
      async (e: any) => {
        const locations = [new RouteLocation(e.detail)];
        const outputLocations = await routeLocator.findRouteLocations({
          locations,
          referenceDate: locations[0].ReferenceDate || undefined,
          outSR: 3857,
        });
        addResultsToMap(outputLocations);
      }
    );

    elcUI.root.addEventListener(
      "find-nearest-route-location-submit",
      (e: any) => {
        // Setup map click event. This should only occur ONCE.
        on.once(this.map, "click", async (mapEvt: any) => {
          const mapPoint = mapEvt.mapPoint;
          let elcResults = await routeLocator.findNearestRouteLocations({
            coordinates: [mapPoint.x, mapPoint.y],
            searchRadius: e.detail.radius,
            inSR: mapPoint.spatialReference.wkid,
            outSR: mapPoint.spatialReference.wkid,
            referenceDate: new Date(),
          });
          if (elcResults.length) {
            elcResults = elcResults.map((r: any) => {
              r = r.toJSON();
              delete r.Coordinates;
              delete r.Angle;
              delete r.RouteGeometry;
              delete r.RealignmentDate;
              delete r.ArmCalcReturnCode;
              delete r.ArmCalcReturnMessage;
              // delete r.EventPoint;
              return new RouteLocation(r);
            });
            const routeLocations = await routeLocator.findRouteLocations({
              locations: elcResults,
              outSR: 3857,
            });
            addResultsToMap(routeLocations);
          } else {
            addResultsToMap(elcResults);
          }
        });
      }
    );

    const infoTemplate = new InfoTemplate("Route Location", graphicToHtml);

    const elcFields = [
      { name: "Id", type: "esriFieldTypeInteger", alias: "ID" },
      { name: "Route", type: "esriFieldTypeString" },
      { name: "Decrease", type: "esriFieldTypeSmallInteger" },
      { name: "Arm", type: "esriFieldTypeDouble", alias: "ARM" },
      { name: "Srmp", type: "esriFieldTypeDouble", alias: "SRMP" },
      { name: "Back", type: "esriFieldTypeSmallInteger" },
      {
        name: "ReferenceDate",
        type: "esriFieldTypeDate",
        alias: "Reference Date",
      },
      {
        name: "ResponseDate",
        type: "esriFieldTypeDate",
        alias: "Response Date",
      },
      {
        name: "RealignmentDate",
        type: "esriFieldTypeDate",
        alias: "Realignment Date",
      },
      { name: "EndArm", type: "esriFieldTypeDouble", alias: "End ARM" },
      { name: "EndSrmp", type: "esriFieldTypeDouble", alias: "End SRMP" },
      { name: "EndBack", type: "esriFieldTypeSmallInteger", alias: "End Back" },
      {
        name: "EndReferenceDate",
        type: "esriFieldTypeDate",
        alias: "End Reference Date",
      },
      {
        name: "EndResponseDate",
        type: "esriFieldTypeDate",
        alias: "End Response Date",
      },
      {
        name: "EndRealignDate",
        type: "esriFieldTypeDate",
        alias: "End Realignment Date",
      },
      {
        name: "ArmCalcReturnCode",
        type: "esriFieldTypeInteger",
        alias: "ArmCalc Return Code",
      },
      {
        name: "ArmCalcEndReturnCode",
        type: "esriFieldTypeInteger",
        alias: "ArmCalc End Return Code",
      },
      {
        name: "ArmCalcReturnMessage",
        type: "esriFieldTypeString",
        alias: "ArmCalc Return Message",
      },
      {
        name: "ArmCalcEndReturnMessage",
        type: "esriFieldTypeString",
        alias: "ArmCalc End Return Message",
      },
      {
        name: "LocatingError",
        type: "esriFieldTypeString",
        alias: "Locating Error",
      },
      // { name: "RouteGeometry", type: "esriFieldTypeGeometry" },
      // { name: "EventPoint", type: "esriFieldTypeGeometry" },
      { name: "Distance", alias: "Offset", type: "esriFieldTypeDouble" },
      { name: "Angle", type: "esriFieldTypeDouble" },
      { name: "IsEvent", type: "esriFieldTypeSmallInteger", alias: "Is Event" },
    ];

    const lineResultsLayer = new FeatureLayer(
      {
        featureSet: null,
        layerDefinition: {
          geometryType: "esriGeometryPolyline",
          fields: elcFields,
        },
      },
      {
        id: "Located Segment",
        infoTemplate,
      }
    );
    lineResultsLayer.setRenderer(lineRenderer);

    const pointResultsLayer = new FeatureLayer(
      {
        featureSet: null,
        layerDefinition: {
          geometryType: "esriGeometryPoint",
          fields: elcFields,
        },
      },
      {
        id: "Located Milepost",
        infoTemplate,
      }
    );

    pointResultsLayer.setRenderer(pointRenderer);

    this._layers = {
      pointResults: pointResultsLayer,
      lineResults: lineResultsLayer,
    };

    const clearBtn = document.querySelector(
      ".clear-graphics-button"
    ) as HTMLButtonElement;
    clearBtn.addEventListener("click", () => {
      pointResultsLayer.clear();
      lineResultsLayer.clear();
    });
  },
  setMap(map: esriMap) {
    map.addLayer(this._layers.lineResults);
    map.addLayer(this._layers.pointResults);
    this.map = map;
  },
});

export default ArcGisElcUI;
