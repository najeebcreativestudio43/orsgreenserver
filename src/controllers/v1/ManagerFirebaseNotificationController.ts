import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import FirebaseService from "../../firebase/FirebaseService";
import { Address, Notification } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { NotificationService, Token } from "../../services";

export default class ManagerFirebaseNotificationController extends Controller {
  public version: string = "v1";

  public path: string = "/manager/firebase/notification";
  protected routes: IRoute[] = [
    {
      path: "/update",
      method: Methods.POST,
      handler: this.sendUpdateNotification,
      localMiddleware: [Token.verify],
    },
  ];

  async sendUpdateNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new FirebaseService();
      const data = await service.sendAppNotifications(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
