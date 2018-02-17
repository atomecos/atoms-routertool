import { HttpRouter } from "atoms-httpcore";
import { Route } from "./route";

export class Router implements HttpRouter {
  private Routes: Route[];

  constructor() {
    Object.defineProperties(this, {
      "Routes": {
        configurable: false,
        enumerable: false,
        writable: false,
        value: [],
      },
    });
  }

  setRoute(actionPath: string, on: { topic: string; type: string; quality: string; }) {
    const _route = new Route(actionPath, on);
    this.Routes.push(new Route(actionPath, on));

    return _route;
  }

  setRoutes(routes: { [actionPath: string]: { topic: string; type: string; quality: string; } }) {
    const actionPaths = Object.keys(routes);
    actionPaths.forEach(actionPath => this.setRoute(actionPath, routes[actionPath]));

    return this.Routes.length;
  }

  resolve(method: string, path: string) {
    for (let i = 0; i < this.Routes.length; i++) {
      const route = this.Routes[i];

      if (route.match(method, path)) {
        return route.resolvePath(path);
      }
    }

    return undefined;
  }
}
