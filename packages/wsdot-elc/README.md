# elc-js

JavaScript client library for accessing WSDOT's [Enterprise Location Class ArcGIS Server SOE].

[![Build Status](https://travis-ci.org/WSDOT-GIS/elc-js.svg)](https://travis-ci.org/WSDOT-GIS/elc-js)

## Installation

```console
npm install wsdot-elc
```

## Example

```typescript
// module import
import { RouteLocation, RouteLocator } from "wsdot-elc";

// Create route locator client object.
const routeLocator = new RouteLocator();

// Find route location. Minimum required parameters.

(async () => {
  const dateString = "12/31/2011";
  const rl = new RouteLocation({
    Route: "005",
    Arm: 0,
    ReferenceDate: new Date(dateString),
  });

  const params = {
    useCors: true,
    locations: [rl],
  };

  const locations = await routeLocator.findRouteLocations(params);
  // do something with the locations.
})();

// use a single reference date instead of per-location date
(async () => {
  const dateString = "12/31/2011";
  const rl = new RouteLocation({
    Route: "005",
    Arm: 0,
  });

  const params = {
    useCors: true,
    locations: [rl],
    referenceDate: new Date(dateString),
  };

  const locations = await routeLocator.findRouteLocations(params);
  // do something with locations.
})();

// find nearest route location
(async () => {
  const params = {
    useCors: true,
    coordinates: [1083893.182, 111526.885],
    referenceDate: new Date("12/31/2011"),
    searchRadius: 1,
    inSR: 2927,
  };

  const locations = await routeLocator.findNearestRouteLocations(params);
  // do something with locations.
})();

// get a list of supported routes
(async () => {
  const routes = await routeLocator.getRouteList(true);
})();
```

## Modules

### RouteLocator

A class that aids in calling the ELC SOE.

### Route

A class that represents a route in WSDOT's Linear Referencing System.

### RouteId

A class that represents a route's ID.

### RouteList

A class that represents the list of routes returned from the ELC SOE's `routes` endpoint.

### RouteLocation

Represents a route location result returned from ELC SOE operations.

[enterprise location class arcgis server soe]: http://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/
[fetch api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[isomorphic-fetch]: https://www.npmjs.com/package/isomorphic-fetch
