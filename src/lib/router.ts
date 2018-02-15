import { IRouter } from "atoms-httpcore";
import { Route } from "./route";

export class Router implements IRouter {
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

  parseFrom(routes: { [key: string]: { topic: string; type: string; quality: string; } }) {
    const keys = Object.keys(routes);
    keys.forEach(actionPath => this.route(actionPath, routes[actionPath]));

    return this.Routes.length;
  }

  route(actionPath: string, on: { topic: string; type: string; quality: string; }) {
    const _route = new Route(actionPath, on);
    this.Routes.push(new Route(actionPath, on));

    return _route;
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
