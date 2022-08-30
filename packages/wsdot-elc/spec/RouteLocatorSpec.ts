/// <reference types="jasmine" />
/// <reference types="node" />

import { flattenArray, RouteLocation, RouteLocator } from "../src/index";

if (typeof fetch === "undefined") {
  require("isomorphic-fetch");
}

describe("RouteLocator", () => {
  const routeLocator = new RouteLocator();

  it("should be able to get routes parse them correctly", async (done) => {
    try {
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
    } catch (err) {
      if (
        err instanceof Error ||
        typeof err === "string" ||
        typeof err === "undefined"
      ) {
        done.fail(err);
      } else {
        throw err;
      }
    }

    done();
  });

  it("should be able to find route locations with minimum parameters supplied.", (done) => {
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

    const promise = routeLocator.findRouteLocations(params);
    promise.then((locations) => {
      expect(locations.length).toEqual(params.locations.length);
      done();
    });
    promise.catch((error) => {
      done.fail(error);
    });
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

  it("should be able to retrieve route data", async (done) => {
    try {
      const routes = await routeLocator.getRouteList(true);
      expect(routes).not.toBeNull();
      if (routes) {
        expect(routes).toBeTruthy();
        for (const year in routes) {
          expect(year).toMatch(/^(\d|(Current))/i);
        }
      }
      done();
    } catch (error) {
      done.fail(error as Error);
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
      "flattened array should have four elements."
    );

    const input = [1, 2, 3, 4];
    const output = flattenArray(input);

    expect(input.length).toEqual(
      output.length,
      "input and output arrays should have the same number of elements."
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
      dateString,
      'The reference date in the output object should be "' + dateString + '".'
    );
    expect(json.Route).toEqual(
      rl.Route,
      'The "Route" properties should be equal.'
    );
    expect(json.Arm).toEqual(rl.Arm, 'The "Arm" properties should be equal.');
  });
});
