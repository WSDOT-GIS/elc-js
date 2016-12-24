import * as RouteLocator from "../RouteLocator";
import * as RouteLocation from "../RouteLocation";

describe("RouteLocator", () => {
  let routeLocator = new RouteLocator();

  it("should be able to find route locations with minimum parameters supplied.", done => {

    let dateString = "12/31/2011";

    let rl = new RouteLocation({
      Route: "005",
      Arm: 0,
      ReferenceDate: new Date(dateString)
    });

    let params = {
      useCors: true,
      locations: [rl]
    };

    let promise = routeLocator.findRouteLocations(params);
    promise.then(locations => {
      expect(locations.length).toEqual(params.locations.length);
      done();
    });
    promise.catch(error => {
      done.fail(error);
    });
  });
});