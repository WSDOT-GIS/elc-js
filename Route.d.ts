import RouteId from "./RouteId";
import * as lrsTypeUtils from "./lrsTypeUtils"
import * as routeTypeUtils from "./routeTypeUtils"

/**
 * Represents a state route.
 **/
export default class Route {
  /**
   * Represents a state route.
   * @param name - The name of the route.
   * @param lrsTypesValue - An integer from 1 to 4, corresponding to one of the following constants:
   *      {@link lrsTypeUtils.LRS_TYPE_INCREASE},
   *      {@link lrsTypeUtils.LRS_TYPE_DECREASE},
   *      {@link lrsTypeUtils.LRS_TYPE_BOTH},
   *      {@link lrsTypeUtils.LRS_TYPE_RAMP}
   * @param routeType -The type of route. E.g., "SR", "IS", "US", "RA"
   **/
  constructor(name: string, lrsTypes: 1 | 2 | 3 | 4, routeType: string | number);
  /**
   * Name of the route
   */
  name: { get(): string };
  /**
   * Text label including route type, if available.
   */
  label: { get(): string };
  /* An integer from 1 to 4, corresponding to one of the following constants:
   * {@link lrsTypeUtils.LRS_TYPE_INCREASE},
   * {@link lrsTypeUtils.LRS_TYPE_DECREASE},
   * {@link lrsTypeUtils.LRS_TYPE_BOTH},
   * {@link lrsTypeUtils.LRS_TYPE_RAMP}
   */
  lrsTypes: { get(): 1 | 2 | 3 | 4 };
  routeType: { get(): number };
  routeTypeAbbreviation: { get(): string };
  routeId: { get(): RouteId };
  /**
   * Returns a boolean value indicating whether the route is increase.
   */
  isIncrease: { get(): boolean };
  /**
   * Returns a boolean value indicating whether the route is decrease.
   */
  isDecrease: { get(): boolean };
  /**
   * Returns a boolean value indicating whether the route is both increase and decrease.
   */
  isBoth: { get(): boolean };
  /**
   * Returns a boolean value indicating whether the route is a ramp.
   */
  isRamp: { get(): boolean };

  static parseRoutes(json:string): any
}