import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { AppConfigService, Token } from "../../services";

export default class ApiAppConfigController extends Controller {
  public version: string = "v1";
  public path: string = "/app/app-config";
  protected routes: IRoute[] = [
    {
      path: "/",
      handler: this.getAppConfig,
      method: Methods.GET,
      localMiddleware: [Token.verifyApiKey],
    },
  ];

  async getAppConfig(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new AppConfigService();
      const data = await service.getAppConfig();
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
