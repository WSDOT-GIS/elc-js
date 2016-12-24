import Route from "./Route"
import RouteLocation from "./RouteLocation"

/**
 * A helper object for querying the ELC REST SOE endpoints.
 */
export default class RouteLocator {
  /**
  * @param {String} [url="https://data.wsdot.wa.gov/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe"] The URL for the ELC REST Endpoint.
  * @param {String} [findRouteLocationsOperationName="Find Route Locations"] - The name of the Find Route Locations operation
  * @param {String} [findNearestRouteLocationsOperationName="Find Nearest Route Locations"] - The name of the Find Nearest Route Locations operation
  * @param {String} [routesResourceName="Route Info"] - Set to "routes" for pre 3.3 versions which do not support the "Route Info" endpoint.
  */
  constructor(
    url?: string,
    findRouteLocationsOperationName?: string,
    findNearestRouteLocationsOperationName?: string,
    routesResourceName?: string
  );
  url: string;
  findRouteLocationsOperationName: string
  findNearestRouteLocationsOperationName: string
  routesResourceName: string
  layerList: any
  /**
   * Returns the map service portion of the ELC REST SOE URL.
   * @return {String} Returns the URL to the map service.
   */
  getMapServiceUrl(): string
  /**
   * Returns a {@link RouteList}
   * @param {boolean} [useCors=true] Set to true if you want to use CORS, false otherwise. (This function does not check client or server for CORS support.)
   * @returns {Promise} - Success: This function takes a single {@link RouteList}, Error: This function takes a single error parameter.
   */
  getRouteList(useCors: boolean): Promise<any>
  /**
   * Converts a Date object into the type of string that the ELC REST SOE methods expect.
   * @param date - A date object.
   * @return A string representation of the input date, if possible, or an empty string.
   */
  static dateToRouteLocatorDate(date: Date): string
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
  findRouteLocations(params: {
    locations: RouteLocation[], referenceDate?: Date, outSR?: number | string, lrsYear?: string, useCors?: boolean
  }): Promise<RouteLocation[]>

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
  findNearestRouteLocations(params: {
    coordinates: number[], referenceDate?: Date, searchRadius: number, inSR: number | string, outSR?: number | string, lrsYear?: string, routeFilter?: string, useCors?: boolean
  }): Promise<RouteLocation[]>
}