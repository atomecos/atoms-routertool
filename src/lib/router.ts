import { IProcessContext } from "atomservicescore";
import { HttpContext, HttpRouter, IComposable } from "atoms-httpcore";
import { Route } from "./route";

export class Router implements HttpRouter, IComposable {
  private Routes: Route[];
  private _notFoundHandler: (ctx: HttpContext, path: string, next: () => Promise<void>) => Promise<void>;
  private _errorHandler: (ctx: HttpContext, error: any, next: () => Promise<void>) => Promise<void>;

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

  set404NotFoundHandler(handler: (ctx: HttpContext, path: string, next: () => Promise<void>) => Promise<void>) {
    this._notFoundHandler = handler;
  }

  set500ErrorHandler(handler: (ctx: HttpContext, error: any, next: () => Promise<void>) => Promise<void>) {
    this._errorHandler = handler;
  }

  resolve(method: string, path: string) {
    for (let i = 0; i < this.Routes.length; i++) {
      const route = this.Routes[i];

      if (route.match(method, path)) {
        return route.resolvePath(path);
      }
    }

    return { channel: undefined, value: undefined };
  }

  toComposing() {
    const default404 = async (ctx: HttpContext, path: string, next: () => Promise<void>) => { };
    const default500 = async (ctx: HttpContext, error: any, next: () => Promise<void>) => { };
    const notFoundHandler = this._notFoundHandler || default404;
    const errorHandler = this._errorHandler || default500;

    return async (ctx: HttpContext, next: () => Promise<void>) => {
      try {
        const { method, path } = ctx;
        const { channel, value } = this.resolve(method, path);

        if (channel) {
          const context = ctx.process;
          const payload = ctx.data(value);
          const action = context.createAction(payload, channel);
          ctx.body = await context.dispatchActionOnPromise(action);
          await next();
        } else {
          ctx.status = 404;
          notFoundHandler(ctx, path, next);
        }
      } catch (error) {
        ctx.status = 500;
        errorHandler(ctx, error, next);
      }
    };
  }
}
