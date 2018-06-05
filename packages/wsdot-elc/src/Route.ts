import FormatError from "./FormatError";
import { getLrsTypeValue, LrsType } from "./lrsTypeUtils";
import RouteId from "./RouteId";
import {
  getRouteTypeAbbreviation,
  getRouteTypeValue,
  RouteTypeAbbreviation,
  RouteTypes
} from "./routeTypeUtils";

/**
 * A module representing a WSDOT route.
 * @module Route
 */

function reviver(k: string, v: any) {
  let output: any;
  if (/^(?:(?:Current)|(?:\d{4,8}))$/.test(k)) {
    output = [];
    for (const routeId in v) {
      if (v.hasOwnProperty(routeId) && routeId.trim()) {
        const currentValue = v[routeId];
        let route: Route | null = null;
        try {
          if (typeof currentValue === "number") {
            route = new Route(routeId, currentValue);
          } else if (currentValue.hasOwnProperty("routeType")) {
            route = new Route(
              routeId,
              currentValue.direction,
              currentValue.routeType
            );
          }
        } catch (error) {
          if (!(error instanceof FormatError)) {
            throw error;
          }
        }
        if (route) {
          output.push(route);
        }
      }
    }
  } else {
    output = v;
  }
  return output;
}

/**
 * Parses a JSON representation of a Route (or an object containing Route properties)
 * into corresponding Route objects.
 * @param {string} json - JSON string
 * @returns {Object} The input JSON string parsed into an Object
 */
export function parseRoutes(json: string) {
  return JSON.parse(json, reviver);
}

/**
 * Represents a state route.
 * @param name - The name of the route.
 * @param lrsTypesValue -
 * @param routeType -The type of route. E.g., "SR", "IS", "US", "RA"
 */
export default class Route {
  private _name: string;
  private _lrsTypes: LrsType;
  private _routeType: RouteTypes | null;
  private _routeId: RouteId;

  /**
   * Creates a Route object.
   * @param name - The name of the route.
   * @param lrsTypesValue - LRS type
   * @param routeType -The type of route. E.g., "SR", "IS", "US", "RA"
   */
  constructor(
    name: string,
    lrsTypesValue: LrsType,
    routeType?: RouteTypes | RouteTypeAbbreviation
  ) {
    this._name = name;
    this._lrsTypes = getLrsTypeValue(lrsTypesValue);
    this._routeType = routeType != null ? getRouteTypeValue(routeType) : null;
    this._routeId = new RouteId(this._name);
  }

  /* @member {string} name The name of the route. */
  public get name() {
    return this._name;
  }
  public get isMainline(): boolean {
    return !this.routeId.rrt;
  }
  /**
   * Text label including route type, if available.
   */
  public get label(): string {
    let output;
    const abbrev = this.routeTypeAbbreviation;
    const routeNum = parseInt(this.routeId.sr, 10);
    if (abbrev) {
      if (abbrev === "SR") {
        output = `WA-${routeNum}`;
      } else if (abbrev === "US") {
        output = `${abbrev}-${routeNum}`;
      } else if (abbrev === "IS") {
        output = `I-${routeNum}`;
      }
    }

    if (!output) {
      output = String(routeNum);
    }
    return output;
  }
  /* @property {number} lrsTypes An integer from 1 to 4, corresponding to one of the following constants:
   *      {@link LrsType.INCREASE},
   *      {@link LrsType.DECREASE},
   *      {@link LrsType.BOTH},
   *      {@link LrsType.RAMP}
   */
  public get lrsTypes(): LrsType {
    return this._lrsTypes;
  }
  public get routeType(): RouteTypes | null {
    return this._routeType;
  }
  public get routeTypeAbbreviation(): RouteTypeAbbreviation | null {
    return this.routeType !== null
      ? getRouteTypeAbbreviation(this.routeType)
      : null;
  }
  public get routeId(): RouteId {
    return this._routeId;
  }
  /**
   * Returns a boolean value indicating whether the route is increase.
   * @return {boolean} Returns true if {@link Route#lrsTypes} equals
   * {@link LrsType.INCREASE} or {@link LrsType.BOTH}.
   */
  public get isIncrease() {
    return (
      this._lrsTypes === LrsType.INCREASE || this._lrsTypes === LrsType.BOTH
    );
  }
  /**
   * Returns a boolean value indicating whether the route is decrease.
   * @return {boolean} Returns true if {@link Route#lrsTypes} equals
   * {@link LrsType.DECREASE} or {@link LrsType.BOTH}.
   */
  public get isDecrease() {
    return this.lrsTypes === LrsType.DECREASE || this.lrsTypes === LrsType.BOTH;
  }
  /**
   * Returns a boolean value indicating whether the route is both increase and decrease.
   * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link LrsType.BOTH}.
   */
  public get isBoth() {
    return this.lrsTypes === LrsType.BOTH;
  }
  /**
   * Returns a boolean value indicating whether the route is a ramp.
   * @return {boolean} Returns true if {@link Route#lrsTypes} equals {@link LrsType.RAMP}
   */
  public get isRamp() {
    return this.lrsTypes === LrsType.RAMP;
  }
}
