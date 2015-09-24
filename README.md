elc-js
======

JavaScript client library for accessing WSDOT's [Enterprise Location Class ArcGIS Server SOE].

[![bitHound Score](https://www.bithound.io/github/WSDOT-GIS/elc-js/badges/score.svg)](https://www.bithound.io/github/WSDOT-GIS/elc-js)

## Modules ##

Most modules are [UMD] modules that will work with browser globals (i.e., loaded via HTML script tags), [AMD] (e.g., Dojo or RequireJS), and [NodeJS].

### RouteLocator ###

A class that aids in calling the ELC SOE.

### Route ###

A class that represents a route in WSDOT's Linear Refrencing System.

### RouteId ###

A class that represent's a route's ID.

### RouteList ###

A class that represents the list of routes returned from the ELC SOE's `routes` endpoint.

### RouteLocation ###

Represents a route location result returned from ELC SOE operations.

### UI ###

These [AMD] modules are used to create user interface components in a web browser.

#### ElcUI ####

Provides user interface that allows user to specify ELC parameters.

#### RouteSelector ####

Control that allows the user to select from a list of *Route* objects. This is a [UMD] modu

#### ArcGisElcUI ####

Extension of *ElcUI* for use with the [ArcGIS API for JavaScript].

See `demo/ArcGisElcUI` folder contents for example usage.


[AMD]:https://github.com/amdjs/amdjs-api/wiki/AMD
[ArcGIS API for JavaScript]:http://js.arcgis.com
[Enterprise Location Class ArcGIS Server SOE]:http://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/
[UMD]:https://github.com/umdjs/umd
[NodeJS]:https://nodejs.org