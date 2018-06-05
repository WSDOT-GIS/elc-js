import ArcGisElcUI from "@wsdot/elc-ui-arcgis-v3";
import Popup = require("esri/dijit/Popup");
import esriMap = require("esri/map");
import RouteLocator from "wsdot-elc";

const elcUrl = (function(urlMatch) {
  return urlMatch ? urlMatch[1] : null;
})(location.search.match(/url=([^=&]+)/i));

const elcUI = new ArcGisElcUI(document.getElementById("elcUI"), {
  bootstrap: false,
  url: elcUrl
});

// Show a modal when no results are found.
elcUI.on("elc-results-not-found", function() {
  // showModal("No results found.", "Alert");
  alert("No results found.");
});

// Show an error message when a location cannot be located.
elcUI.on("non-geometry-results-returned", function(e: any) {
  console.log("non geometry results found", e);
  const elcResult = e.elcResults[0];
  const output = new Array<string>();
  const properties = [
    "LocatingError",
    "ArmCalcReturnMessage",
    "ArmCalcEndReturnMessage"
  ];
  properties.forEach(function(name) {
    if (elcResult[name]) {
      output.push(`${name}: ${elcResult[name]}`);
    }
  });
  const message = output.join("\n");
  alert(message);
});

// Add a point to the map when results are found.
elcUI.on("elc-results-found", function(e: any) {
  let point;
  if (e && e.graphics && e.graphics.length > 0) {
    point = e.graphics[0].geometry;
    if (point.getPoint) {
      point = point.getPoint(0, 0);
    }
    map.infoWindow.show(point);
    map.centerAt(point);
    const popup = map.infoWindow as Popup;
    popup.setFeatures(e.graphics);
  }
});

// Create the map.
const map = new esriMap("map", {
  basemap: "osm",
  center: [-120.80566406246835, 47.41322033015946],
  zoom: 7,
  showAttribution: true
});

// When the map has loaded, set the elcUI's map property.
map.on("load", function() {
  elcUI.setMap(map);
});
