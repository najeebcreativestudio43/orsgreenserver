import {
  Response,
  Request,
  NextFunction,
  Router,
  RequestHandler,
} from "express";
import logging from "../config/logging";
export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export interface IRoute {
  path: string;
  method: Methods;
  handler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>;
  localMiddleware: ((
    req: Request,
    res: Response,
    next: NextFunction
  ) => void)[];
  description?: string;
}

export default abstract class Controller {
  public abstract version: string;
  public router: Router = Router();
  public abstract path: string;
  protected abstract readonly routes: Array<IRoute> = [];

  constructor() {
    this.sendSuccess = this.sendSuccess.bind(this);
    this.sendError = this.sendError.bind(this);
  }

  public setRoutes = (): Router => {
    for (const route of this.routes) {
      for (const mw of route.localMiddleware) {
        this.router.use(route.path, mw);
      }
      switch (route.method) {
        case "GET":
          this.router.get(route.path, route.handler);
          break;
        case "POST":
          this.router.post(route.path, route.handler);
          break;
        case "PUT":
          this.router.put(route.path, route.handler);
          break;
        case "DELETE":
          this.router.delete(route.path, route.handler);
          break;
        default:
          logging.info("ROUTE", "not a valid method");
          break;
      }
    }
    return this.router;
  };

  protected sendSuccess(
    res: Response,
    data?: object | any,
    message?: string,
    version: string = "v1"
  ): Response {
    return res.status(200).json({
      version: version,
      message: message || "success",
      data: data,
    });
  }

  protected sendError(
    res: Response,
    message?: string,
    data?: object,
    version: string = "v1"
  ): Response {
    return res.status(500).json({
      version: version,
      message: message || "internal server error",
      data,
    });
  }
}
