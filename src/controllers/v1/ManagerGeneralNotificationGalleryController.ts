import { Request, Response, NextFunction } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import {
  GeneralNotificaitionGalleryService,
  FileUploadService,
  Token,
} from "../../services";
const fileUploadService = new FileUploadService("general-notification-gallery");

export default class ManagerGeneralNotificationGalleryController extends Controller {
  public version: string = "v1";
  public path: string = "/manager/general-notification-gallery";
  protected routes: IRoute[] = [
    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateOneById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "generalNotificationGallery",
          action: "update",
        }),
        fileUploadService.upload.single("file"),
      ],
    },
    {
      path: "/:id",
      method: Methods.DELETE,
      handler: this.deleteOneById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "generalNotificationGallery",
          action: "delete",
        }),
      ],
    },
    {
      path: "/",
      method: Methods.POST,
      handler: this.save,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "generalNotificationGallery",
          action: "create",
        }),
        fileUploadService.upload.single("image"),
      ],
    },
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAll,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "generalNotificationGallery",
          action: "read",
        }),
      ],
    },
  ];

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = new GeneralNotificaitionGalleryService();
      const data = await service.save(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new GeneralNotificaitionGalleryService();
      const data = await service.find();
      super.sendSuccess(res, data.data, "Notification gallery images");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async deleteOneById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new GeneralNotificaitionGalleryService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        FileUploadService.deleteFile(data.data.image);
        super.sendSuccess(
          res,
          data.data,
          "Notification gallery image deleted successfully"
        );
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async updateOneById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      req.body.image = JSON.parse(req.body.image);
      let imageToBeDeleted = undefined;
      if (req.file) {
        imageToBeDeleted = req.body.image;
        req.body.image = req.file;
      }
      const service = new GeneralNotificaitionGalleryService();
      const data = await service.update({ _id: id }, req.body);
      FileUploadService.deleteFile(imageToBeDeleted);
      super.sendSuccess(
        res,
        data.data,
        "Notification gallery updated successfully"
      );
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
