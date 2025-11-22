import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { OrderService, Token } from "../../services";

export default class ManagerUserOrderController extends Controller {
  public version: string = "v1";
  public path: string = "/manager/user/order";
  protected routes: IRoute[] = [
    {
      path: "/:adminid/:userid",
      method: Methods.GET,
      handler: this.findOrdersByUserId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "userOrder",
          action: "read",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "adminid",
            },
          ],
        }),
      ],
    },
  ];

  async findOrdersByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, userid } = req.params;
      const service = new OrderService();
      const data = await service.findOrderWithProductAndUserDetail({
        userId: Types.ObjectId(userid),
        adminId: Types.ObjectId(adminid),
      });
      super.sendSuccess(res, data, "User orders list");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
