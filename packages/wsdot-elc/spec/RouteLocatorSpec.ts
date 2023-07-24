import { flattenArray, RouteLocation, RouteLocator } from "../src/index";

describe("RouteLocator", async () => {
  const routeLocator = new RouteLocator();

  it("should be able to get routes parse them correctly", async () => {
      const routeList = await routeLocator.getRouteList(true);
      if (!routeList) {
        throw new TypeError("route list should not be falsy");
      }
      const routeYearRe = /((Current)|(\d{4}))/i;
      for (const year in routeList) {
        if (Object.prototype.hasOwnProperty.call(routeList, year)) {
          expect(year).toMatch(routeYearRe);
          const routeArray = routeList[year];
          for (const route of routeArray) {
            expect(!route.routeId.rrt).toBe(route.isMainline);
          }
        }
      }
  });

  it("should be able to find route locations with minimum parameters supplied.", async () => {
    const dateString = "12/31/2011";

    const rl = new RouteLocation({
      Route: "005",
      Arm: 0,
      ReferenceDate: new Date(dateString),
    });

    const params = {
      useCors: true,
      locations: [rl],
    };

    const locations = await routeLocator.findRouteLocations(params);
    expect(locations.length).toEqual(params.locations.length);
  });

  it("should be able to find route locations with global reference date specified.", (done) => {
    const dateString = "12/31/2011";
    const rl = new RouteLocation({
      Route: "005",
      Arm: 0,
    });

    const params = {
      useCors: true,
      locations: [rl],
      referenceDate: new Date(dateString),
    };

    routeLocator.findRouteLocations(params).then(
      (data) => {
        expect(data.length).toEqual(params.locations.length);
        done();
      },
      (error) => {
        done.fail(error);
      }
    );
  });

  it("should be able to find nearest route locations.", (done) => {
    const params = {
      useCors: true,
      coordinates: [1083893.182, 111526.885],
      referenceDate: new Date("12/31/2011"),
      searchRadius: 1,
      inSR: 2927,
    };

    routeLocator.findNearestRouteLocations(params).then(
      (data) => {
        expect(data).toBeTruthy();
        done();
      },
      (error) => {
        done.fail(error);
      }
    );
  });

  it("should be able to retrieve route data", async () => {
      const routes = await routeLocator.getRouteList(true);
      expect(routes).not.toBeNull();
      if (routes) {
        expect(routes).toBeTruthy();
        for (const year in routes) {
          expect(year).toMatch(/^(\d|(Current))/i);
        }
      }
  });
});

describe("utils", () => {
  it("should be able to flatten array.", () => {
    const array = [
      [1, 2],
      [3, 4],
    ];
    const flattened = flattenArray(array);

    expect(flattened.length).toEqual(
      4,
    );

    const input = [1, 2, 3, 4];
    const output = flattenArray(input);

    expect(input.length).toEqual(
      output.length,
    );

    output.forEach((value, i) => {
      expect(value).toEqual(input[i]);
      value = input[i];
    });
  });
});

describe("Serialization", () => {
  it("should be able to be serialized to JSON string", () => {
    const dateString = "12/31/2011";

    const rl = new RouteLocation({
      Route: "005",
      Arm: 0,
      ReferenceDate: new Date(dateString),
    });

    const json = rl.toJSON();
    expect(json.ReferenceDate).toEqual(
      dateString
    );
    expect(json.Route).toEqual(
      rl.Route
    );
    expect(json.Arm).toEqual(rl.Arm);
  });
});
