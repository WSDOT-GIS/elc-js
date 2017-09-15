elc-js
======

JavaScript client library for accessing WSDOT's [Enterprise Location Class ArcGIS Server SOE].

[![Build Status](https://travis-ci.org/WSDOT-GIS/elc-js.svg)](https://travis-ci.org/WSDOT-GIS/elc-js)
[![bitHound Score](https://www.bithound.io/github/WSDOT-GIS/elc-js/badges/score.svg)](https://www.bithound.io/github/WSDOT-GIS/elc-js)

## Installation ##

```console
npm install wsdot-elc
```

<!--
This package is registered with [Bower] with the name `wsdot-route-locator`.

Once you have [Bower] installed on your system, you can run the following command at the command line to download the package and all dependencies to your project.

    $ bower install wsdot-route-locator --save

-->

## Modules ##

Most modules are [UMD] modules that will work with  [AMD] (e.g., Dojo or RequireJS) and [NodeJS].

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

[AMD]:https://github.com/amdjs/amdjs-api/wiki/AMD
[ArcGIS API for JavaScript]:http://js.arcgis.com
[Bower]:http://bower.io
[Enterprise Location Class ArcGIS Server SOE]:http://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/
[UMD]:https://github.com/umdjs/umd
[NodeJS]:https://nodejs.org
[Package Installer]:https://visualstudiogallery.msdn.microsoft.com/753b9720-1638-4f9a-ad8d-2c45a410fd74?SRC=VSIDE