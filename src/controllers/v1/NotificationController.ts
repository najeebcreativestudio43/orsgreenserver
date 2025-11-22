import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Notification } from "../../models";
import NotificationUtils from "../../notifications/NotificationUtils";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { NotificationService, Token } from "../../services";

export default class NotificationController extends CRUDController<
  Notification,
  NotificationService
> {
  constructor() {
    super(new NotificationService());
  }
  public version: string = "v1";
  public path: string = "/manager/notification";
  protected routes: IRoute[] = [
    {
      path: "/product/:adminid",
      method: Methods.POST,
      handler: this.sendProductNotification,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "notification",
          action: "create",
        }),
      ],
    },
    {
      path: "/:adminid/:id",
      method: Methods.DELETE,
      handler: this.deleteOneById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "notification",
          action: "delete",
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

    {
      path: "/:adminid",
      method: Methods.GET,
      handler: this.findAllByReceiverId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "notification",
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

  async findAllByReceiverId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      const service = new NotificationService();
      const data = await service.findAllByReceoverId(adminid);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async sendProductNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await NotificationUtils.sendProductNotification(req);
      super.sendSuccess(
        res,
        undefined,
        "Product notification successfully sent to all users"
      );
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
