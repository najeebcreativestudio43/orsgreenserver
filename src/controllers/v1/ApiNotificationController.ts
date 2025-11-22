import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Address, Notification } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { NotificationService, Token } from "../../services";

export default class ApiNotificationController extends CRUDController<
  Notification,
  NotificationService
> {
  public version: string = "v1";
  constructor() {
    super(new NotificationService());
  }
  public path: string = "/app/notifications";
  protected routes: IRoute[] = [
    {
      path: "/:userid",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "notifications",
          action: "read",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "userid",
            },
          ],
        }),
      ],
    },
  ];

  async findAllByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userid } = req.params;
      const service = new NotificationService();
      const data = await service.findAllByReceoverId(userid);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
