export default class RouteLocator {
  constructor(
    url?: string,
    findRouteLocationsOperationName?: string,
    findNearestRouteLocationsOperationName?: string,
    routesResourceName?: string
  );
  layerList: any
  getMapServiceUrl(): string
}