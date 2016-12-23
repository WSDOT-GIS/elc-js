/**
 * Represents a WSDOT State Route Identifier
 */
export default class RouteId {
  constructor(routeId: string);
  sr: {
    get(): string
  };
  rrt: {
    get(): string | null
  };
  rrq: {
    get(): string | null
  };
  rrtDescription: {
    get(): string | null
  };
  /**
   * The milepost on the mainline route where this route attaches.
   * Will be null if the RRQ is non-numeric.
   */
  mainlineIntersectionMP: {
    get(): number | string | null
  }
  /**
   * Description of the route ID's RRQ portion, if it exists. Null otherwise.
   */
  rrqDescription: {
    get(): string | null
  }
  /**
   * Extended description of the route ID.
   */
  description: {
    get(): string
  };
  /**
   * Returns a string representation of the RouteID.
   */
  toString(): string
  /**
   * A comparison method used for sorting {@link RouteId} objects.
   * @param {RouteId} a - RouteId object to be compared
   * @param {RouteId} b - RouteId object to be compared
   * @returns {number} Returns a value indicating if a should be before b or vice-versa.
   */
  static sort(a: RouteId, b: RouteId): number
}