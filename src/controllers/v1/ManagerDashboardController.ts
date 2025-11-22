import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { DashboardService, Token } from "../../services";

export default class ManagerDashboardController extends Controller {
  public version: string = "v1";
  public path: string = "/manager/dashboard";
  protected routes: IRoute[] = [
    {
      path: "/stats/:adminid",
      method: Methods.GET,
      handler: this.getDashboardStatesByAdminId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "orderState",
          action: "read",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            { source: "params", key: "adminid" },
          ],
        }),
      ],
    },
  ];

  async getDashboardStatesByAdminId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new DashboardService();
      const data = await service.getDashboardStatesByAdminId(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
