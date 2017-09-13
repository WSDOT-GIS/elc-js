import RouteLocation from "../RouteLocation";
import { IRouteLocation } from "../RouteLocationInterfaces";
import RouteLocator, { IFindRouteLocationsParameters} from "../RouteLocator";

describe("RouteLocator", () => {
  const routeLocator = new RouteLocator();

  it("should be able to find route locations with minimum parameters supplied.", (done) => {

    const dateString = "12/31/2011";

    const rl = new RouteLocation({
      Route: "005",
      Arm: 0,
      ReferenceDate: new Date(dateString)
    });

    const params: IFindRouteLocationsParameters = {
      useCors: true,
      locations: [rl]
    };

    const promise = routeLocator.findRouteLocations(params);
    promise.then((locations) => {
      expect(locations.length).toEqual(params.locations.length);
      done();
    });
    promise.catch((error) => {
      done.fail(error);
    });
  });
});
