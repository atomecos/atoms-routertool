import { InvalidValueError } from "atomservicescore";
import * as PathToRegExp from "path-to-regexp";

export class Route {
  Method: string;
  Path: string;
  On: { topic: string; type: string; quality: string; };
  PathREX: RegExp;
  private names: string[];

  constructor(actionPath: string, on: { topic: string; type: string; quality: string; }) {
    const { method, path } = Route.resolveActionPath(actionPath);
    const _keysREX: PathToRegExp.Key[] = [];
    const _pathREX = PathToRegExp(path, _keysREX);
    const _names = _keysREX.map(each => each.name);

    Object.defineProperties(this, {
      "Method": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: method,
      },
      "Path": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: path,
      },
      "On": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: {},
      },
      "PathREX": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: _pathREX,
      },
      "names": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: _names,
      },
    });

    Object.defineProperties(this.On, {
      "topic": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: on.topic,
      },
      "type": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: on.type,
      },
      "quality": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: on.quality,
      },
    });
  }

  matchMethod(method: string) {
    if (this.Method === "ALL") {
      return true;
    } else {
      method = method.toUpperCase();
      method = method === "DEL" ? "DELETE" : method;

      return this.Method === method;
    }
  }

  matchPath(path: string) {
    return this.PathREX.test(path);
  }

  match(method: string, path: string) {
    return this.matchMethod(method) && this.matchPath(path);
  }

  parseValue(path: string) {
    const _exec = this.PathREX.exec(path);

    if (_exec) {
      const value: { [name: string]: string; } = {};
      for (let i = 0; i < this.names.length; i++) {
        const name = this.names[i];
        value[name] = _exec[i + 1];
      }

      return value;
    } else {
      return undefined;
    }
  }

  resolvePath(path: string) {
    const value = this.parseValue(path);

    if (value) {
      return { channel: this.On, value };
    } else {
      return undefined;
    }
  }

  static resolveActionPath(actionPath: string) {
    const vals = actionPath.split(" ");
    if (vals.length == 2) {
      let method = vals[0].toUpperCase();
      const path = vals[1];

      if (method === "DEL") {
        method = "DELETE";
      }

      return { method, path };
    } else {
      throw new InvalidValueError("actionPath", actionPath);
    }
  }
}
