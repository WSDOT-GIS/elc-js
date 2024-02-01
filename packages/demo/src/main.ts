import { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

const apiKey =
  "AAPK2fe9d5bf075b4a76b80c3c2df25e34668D6EZOaitj-5PUG9TPt3eUpNHVWdPREfvAXhFIboaxH3jXWzSRt-sZMYUMi7ZGiF";
const basemapEnum = "ArcGIS:Topographic";

const map = new Map({
  container: "map", // container id
  style: `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/${basemapEnum}?type=style&token=${apiKey}`,
  center: {
    lng: -120.81055357905363,
    lat: 47.290771938843505,
  }, // starting position [lng, lat]
  zoom: 6, // starting zoom
});

console.debug("map", map);

map.on("click", (e) => {
  console.debug("click", e);
});
