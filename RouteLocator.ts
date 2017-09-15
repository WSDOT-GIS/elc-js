import { default as Route, parseRoutes } from "./Route";
import RouteLocation from "./RouteLocation";
import { IRouteLocation } from "./RouteLocationInterfaces";
import { flattenArray, getActualMonth } from "./routeUtils";

// Only browsers have build in support for fetch API.
// Must be added for node.
if (typeof window === "undefined") {
    var fetch = require("node-fetch");
}

/**
 * Converts an object into a query string.
 * @param {Object} o - An object
 * @returns {string} Returns a query string representation of the input object.
 */
function toQueryString(o: any): string {
    const output = [];
    for (const name in o) {
        if (o.hasOwnProperty(name)) {
            let value = o[name];
            if (value == null) {
                value = "";
            }
            output.push([name, encodeURIComponent(value)].join("="));
        }
    }
    return output.join("&");
}

/** Tests if a URL is under a certain length. This is used to determine whether POST should be used instead of GET.
 * @param {string} url - A URL
 * @param {number} [maxLength=2000] - The threshold URL length used to determine if GET or POST is used.
 * @returns {Boolean} Returns true if url exceeds maxLength, false otherwise.
 */
function isUrlTooLong(url: string, maxLength: number = 2000): boolean {
    if (!maxLength) {
        maxLength = 2000;
    }
    if (typeof url === "string") {
        return url.length > 2000;
    }
    return false;
}

// Used for JSON deserialization to RouteLocation objects.
function routeLocationReviver(k: string, v: any) {
    if (typeof v === "object" && v.hasOwnProperty("Route")) {
        return new RouteLocation(v);
    } else {
        return v;
    }
}

/**
 * Converts a Date object into the type of string that the ELC REST SOE methods expect.
 * @author Jeff Jacobson
 * @param {Date} date - A date object.
 * @return {string} A string representation of the input date, if possible, or an empty string.
 * @memberOf RouteLocator
 */
function dateToRouteLocatorDate(date: Date): string {
    let elcDate: string;
    if (typeof date === "object" && date instanceof Date) {
        // Convert date to a string, as that is what the API is expecting.
        elcDate = [
            String(getActualMonth(date)),
            String(date.getDate()),
            String(date.getFullYear())
        ].join("/");
    } else {
        elcDate = date || "";
    }
    return elcDate;
}

/**
 * The parameters for the Find Route Locations query.
 */
export interface IFindRouteLocationsParameters {
    /** An array of RouteLocation objects. */
    locations: RouteLocation[];
    /** The date that the locations were collected.  This can be omitted if each of the locations in the input array have their ReferenceDate properties set to a Date value. */
    referenceDate?: Date;
    /** The spatial reference for the output geometry, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service. */
    outSR?: number | string;
    /** The spatial reference for the output geometry, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service. */
    lrsYear?: string;
    /** If you are sure both your client (browser) and ELC server support CORS, you can set this to true.  Otherwise leave it set to false. */
    useCors?: boolean;
}

/**
 * @property {number[]} params.coordinates An array of numbers with at least two elements.  Even indexed elements represent X coordinates; odd represent Y coordinates.
 * @property {Date} [params.referenceDate] The date that the locations were collected.  This can be omitted if each of the locations in the input array have their ReferenceDate properties set to a Date value.
 * @property {number} params.searchRadius The distance in feet to search around each of the coordinates for a state route.
 * @property {number|string} params.inSR The spatial reference of the coordinates, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service.
 * @property {number|string} [params.outSR] The spatial reference for the output geometry, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service.
 * @property {string} [params.lrsYear] Indicates which LRS layers will be used for linear referencing.  If omitted, the current LRS will be used. (E.g., "Current", "2008", "2005", "2005B".)
 * @property {string} [params.routeFilter] A partial SQL query that can be used to limit which routes are searched.  E.g., "LIKE '005%'" or "'005'".
 * @property {boolean} [params.useCors=true] If you are sure both your client (browser) and ELC server support CORS, you can set this to true.  Otherwise leave it set to false.
 */
export interface IFindNearestRouteLocationParameters {
    coordinates: number[];
    referenceDate: Date;
    searchRadius: number;
    inSR: number | string;
    outSR?: number | string;
    lrsYear?: string;
    routeFilter?: string;
    useCors?: boolean;
}

export default class RouteLocator {
    private layerList: { [key: string]: Route[] } | null = null;

    /**
     * A helper object for querying the ELC REST SOE endpoints.
     * @constructor
     * @param {String} [url="https://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe"] The URL for the ELC REST Endpoint.
     * @param {String} [findRouteLocationsOperationName="Find Route Locations"] - The name of the Find Route Locations operation
     * @param {String} [findNearestRouteLocationsOperationName="Find Nearest Route Locations"] - The name of the Find Nearest Route Locations operation
     * @param {String} [routesResourceName="Route Info"] - Set to "routes" for pre 3.3 versions which do not support the "Route Info" endpoint.
     */
    constructor(
        public url: string = "https://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe",
        public findRouteLocationsOperationName: string = "Find Route Locations",
        public findNearestRouteLocationsOperationName: string = "Find Nearest Route Locations",
        public routesResourceName: string = "Route Info") {
    }

    /**
     * Returns the map service portion of the ELC REST SOE URL.
     * @return {String} Returns the URL to the map service.
     */
    public get mapServiceUrl() {
        const match = this.url.match(/.+\/MapServer/gi);
        if (match) {
            return match[0];
        }
    }

    /**
     * A dictionary of route arrays, keyed by year.
     * @typedef {Object.<string, Route[]>} RouteList
     */

    /**
     * Returns a {@link RouteList}
     * @param {boolean} [useCors=true] Set to true if you want to use CORS, false otherwise. (This function does not check client or server for CORS support.)
     * @returns {Promise} - Success: This function takes a single {@link RouteList}, Error: This function takes a single error parameter.
     */
    public async getRouteList(useCors: boolean = true): Promise<{ [key: string]: Route[] } | null> {
        // var this = this, data, request, url;

        if (this.layerList) {
            return this.layerList;
        }

        let url = [this.url, this.routesResourceName].join("/");
        const queryData: { [key: string]: any } = {
            f: "json"
        };
        if (!useCors) {
            queryData.callback = "jsonp";
        }
        url = [url, toQueryString(queryData)].join("?");

        const response = await fetch(url);
        if (response.status === 200) {
            const data = parseRoutes(await response.text());
            if (data.error) {
                if (this.routesResourceName === "Route Info" && data.error.code === 400) {
                    // If the newer Route Info is not supported, try the older version.
                    // console.warn('The "Route Info" endpoint is not supported. Trying the older "route"..."', url);
                    this.routesResourceName = "routes";
                    return this.getRouteList(useCors);
                } else {
                    throw Error(data.error);
                }
            } else {
                this.layerList = data;
                return this.layerList;
            }
        } else {
            throw Error(response.statusText);
        }
    }

    /**
     * Calls the ELC REST SOE to get geometry corresponding to the input locations.
     * @author Jeff Jacobson
     * @param {object} params The parameters for the Find Route Locations query.
     * @param {RouteLocation[]} params.locations An array of RouteLocaiton objects.
     * @param {Date} [params.referenceDate] The date that the locations were collected.  This can be omitted if each of the locations in the input array have their ReferenceDate properties set to a Date value.
     * @param {number|string} [params.outSR] The spatial reference for the output geometry, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service.
     * @param {string} [params.lrsYear] Indicates which LRS layers will be used for linear referencing.  If omitted, the current LRS will be used. (E.g., "Current", "2008", "2005", "2005B".)
     * @param {boolean} [params.useCors=false] If you are sure both your client (browser) and ELC server support CORS, you can set this to true.  Otherwise leave it set to false.
     * @returns {Promise} Returns a promise.
     * @throws {Error} Thrown if invalid parameters are specified.
     */
    public async findRouteLocations(params: IFindRouteLocationsParameters): Promise<RouteLocation[]> {
        const locations = params.locations;
        // Set the reference date to an empty string if a value is not provided.  This is what the ELC REST SOE expects when omitting this value. (Hopefully this can be changed in the future.)
        let referenceDate = params.referenceDate || "";
        const outSR = params.outSR || null;
        const lrsYear = params.lrsYear || null;
        const useCors = params.useCors != null ? params.useCors : true;

        if (typeof locations !== "object" || !(locations instanceof Array)) {
            throw new Error("The locations parameter must be an array of RouteLocations with at least one element.");
        } else if (!locations.length) { // locations has no elements or no length property...
            throw new Error("locations does not have enough elements.");
        }

        if (typeof referenceDate === "object" && referenceDate instanceof Date) {
            // Convert date to a string, as that is what the API is expecting.
            referenceDate = [
                String(getActualMonth(referenceDate)),
                String(referenceDate.getDate()),
                String(referenceDate.getFullYear())
            ].join("/");
        }/*
         else if (typeof referenceDate !== "string") {
                    console.debug(typeof referenceDate !== "string");
                    throw new Error("Unexpected referenceDate type.  Expected a Date or a string.");
        }*/

        if (typeof outSR !== "undefined" && outSR !== null && typeof outSR !== "number" && typeof outSR !== "string") {
            throw new Error("Unexpected outSR type.  Must be a WKID (number), WKT (string), or omitted (null or undefined).");
        }

        if (typeof lrsYear !== "undefined" && lrsYear !== null && typeof lrsYear !== "string") {
            throw new Error("Invalid lrsYear.  Must be either a string or omitted altogether.");
        }

        // Construct the HTTP request.
        const data: any = {
            f: "json",
            locations: JSON.stringify(locations),
            outSR: outSR || null,
            referenceDate: referenceDate || null,
            lrsYear: lrsYear || null
        };

        let url = [this.url, this.findRouteLocationsOperationName].join("/");
        if (!useCors) {
            data.callback = "jsonp";
        }
        let formData: string | null = toQueryString(data);

        // Determine whether to use GET or POST based on URL length.
        const method = isUrlTooLong([url, formData].join("?")) ? "POST" : "GET";

        let init: RequestInit | undefined;

        if (method === "GET") {
            url = [url, formData].join("?");
            formData = null;
        } else {
            const headers = new Headers();
            headers.append("Content-Type", "application/x-www-form-urlencoded");

            init = {
                method,
                headers,
                body: formData
            };

            if (useCors) {
                init.mode = "cors";
            }
        }

        const response = await fetch(url, init);
        const json = JSON.parse(await response.text(), routeLocationReviver);
        if (json.error) {
            throw Error(json);
        }
        return json;

    }

    /**
     * Calls the ELC REST SOE to get the route locations corresponding to the input point coordinates.
     * @author Jeff Jacobson
     * @param {object} params - See below for details
     * @param {number[]} params.coordinates An array of numbers with at least two elements.  Even indexed elements represent X coordinates; odd represent Y coordinates.
     * @param {Date} [params.referenceDate] The date that the locations were collected.  This can be omitted if each of the locations in the input array have their ReferenceDate properties set to a Date value.
     * @param {number} params.searchRadius The distance in feet to search around each of the coordinates for a state route.
     * @param {number|string} params.inSR The spatial reference of the coordinates, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service.
     * @param {number|string} [params.outSR] The spatial reference for the output geometry, either a WKID or WKT.  If omitted the output geometry will be the same as that of the ELC map service.
     * @param {string} [params.lrsYear] Indicates which LRS layers will be used for linear referencing.  If omitted, the current LRS will be used. (E.g., "Current", "2008", "2005", "2005B".)
     * @param {string} [params.routeFilter] A partial SQL query that can be used to limit which routes are searched.  E.g., "LIKE '005%'" or "'005'".
     * @param {boolean} [params.useCors=true] If you are sure both your client (browser) and ELC server support CORS, you can set this to true.  Otherwise leave it set to false.
     * @throws {Error} Throws an error if any of the params properties are provided with invalid values.
     * @returns {Promise} A promise
     */
    public async findNearestRouteLocations(params: IFindNearestRouteLocationParameters): Promise<RouteLocation[]> {
        const elcParams: any = {
            f: "json"
        };

        if (params.useCors == null) {
            params.useCors = true;
        }

        if (typeof params.referenceDate === "undefined" || params.referenceDate === null) {
            throw new Error("referenceDate not provided.");
        } else {
            // Convert the date into the format that the ELC is expecting.
            elcParams.referenceDate = dateToRouteLocatorDate(params.referenceDate);
        }

        // validate coordinates.
        params.coordinates = flattenArray(params.coordinates); // Run the flattenArray function to ensure array elements are not arrays themselves.
        if (typeof params.coordinates !== "object" || !(params.coordinates instanceof Array)) {
            throw new TypeError("The coordinates parameter must be an array of numbers.");
        } else if (params.coordinates.length < 2 || params.coordinates.length % 2 !== 0) {
            throw new TypeError("The coordinates array must contain at least two elements and consist of an even number of elements.");
        }
        // Stringify the coordinates and assign to elcParams.
        elcParams.coordinates = JSON.stringify(params.coordinates);

        // validate search radius
        if (typeof params.searchRadius !== "number" || params.searchRadius <= 0) {
            throw new Error("searchRadius must be a number that is greater than zero.");
        } else {
            elcParams.searchRadius = params.searchRadius;
        }

        // validate inSR.
        if (typeof params.inSR !== "number" && typeof params.outSR !== "string") {
            throw new Error("Unexpected inSR type.  The inSR value must be either a WKID (number) or a WKT (string).");
        } else {
            elcParams.inSR = params.inSR;
        }

        // validate outSR.
        if (typeof params.outSR !== "undefined" && params.outSR !== null && typeof params.outSR !== "number" && typeof params.outSR !== "string") {
            throw new Error("Unexpected outSR type.  Must be a WKID (number), WKT (string), or omitted (null or undefined).");
        } else {
            elcParams.outSR = params.outSR;
        }

        // validate LRS year.
        // Make sure lrsYear is either a string or omitted (null or undefined).  (The previous "if" statement has already converted from number to string, if necessary.)
        if (typeof params.lrsYear !== "undefined" && params.lrsYear !== null && typeof params.lrsYear !== "string") {
            throw new Error("Invalid lrsYear.  Must be either a string or omitted altogether.");
        } else {
            elcParams.lrsYear = params.lrsYear || undefined;
        }

        // validate routeFilter
        elcParams.routeFilter = params.routeFilter || undefined;
        if (typeof params.routeFilter !== "undefined" && typeof params.routeFilter !== "string") {
            throw new Error("Invalid route filter type.  The routeFilter parameter should be either a string or omitted altogether.");
        }

        let url = [this.url, this.findNearestRouteLocationsOperationName].join("/");
        if (!params.useCors) {
            elcParams.callback = "jsonp";
        }
        const body = toQueryString(elcParams);
        const method = isUrlTooLong(url + "?" + body) ? "POST" : "GET";

        let init: RequestInit | undefined;

        if (method === "GET") {
            url = [url, body].join("?");
        } else {
            const headers = new Headers();
            headers.append("Content-Type", "application/x-www-form-urlencoded");

            init = {
                body,
                method,
                headers
            };
            if (params.useCors) {
                init.mode = "cors";
            }
        }
        const response = await fetch(url, init);
        const json = JSON.parse(await response.text(), routeLocationReviver);
        if (json.error) {
            throw Error(json);
        }
        return json;
    }
}
