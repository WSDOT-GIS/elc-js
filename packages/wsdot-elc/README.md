elc-js
======

JavaScript client library for accessing WSDOT's [Enterprise Location Class ArcGIS Server SOE].

[![Build Status](https://travis-ci.org/WSDOT-GIS/elc-js.svg)](https://travis-ci.org/WSDOT-GIS/elc-js)

## Installation ##

```console
npm install wsdot-elc
```

## Modules ##

### RouteLocator ###

A class that aids in calling the ELC SOE.

### Route ###

A class that represents a route in WSDOT's Linear Referencing System.

### RouteId ###

A class that represents a route's ID.

### RouteList ###

A class that represents the list of routes returned from the ELC SOE's `routes` endpoint.

### RouteLocation ###

Represents a route location result returned from ELC SOE operations.

[Enterprise Location Class ArcGIS Server SOE]:http://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/