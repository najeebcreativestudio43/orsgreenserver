import { NextFunction, Request, Response } from "express";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { BannerService, Token } from "../../services";

export default class ApiBannerController extends Controller {
  public version: string = "v1";
  public path: string = "/app/banners";
  protected routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllBanners,
      localMiddleware: [Token.verifyApiKey],
    },
  ]; 

  async findAllBanners(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new BannerService();
      const data = await service.find({ isActive: true });
      super.sendSuccess(res, data.data, "Banners list");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
