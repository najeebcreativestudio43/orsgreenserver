import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { AdminService, FileUploadService, Token } from "../../services";
import Utils from "../../Utils/Utils";

const uploadService = new FileUploadService("admin");

export default class AdminTradersController extends Controller {
  public version: string = "v1";
  public path: string = "/admin/traders";
  protected routes: IRoute[] = [
    {
      path: "/store/:id",
      method: Methods.PUT,
      handler: this.updateAdminStoreInfo,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "update",
        }),
        uploadService.upload.single("file"),
      ],
      description: "Update admin store info by id",
    },
    {
      path: "/address/:id",
      method: Methods.PUT,
      handler: this.updateAdminAddress,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "update",
        }),
      ],
      description: "Update admin address by id",
    },
    {
      path: "/password/:id",
      method: Methods.PUT,
      handler: this.changePasswordById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "update",
        }),
      ],
      description: "Change password user by {password , currentPassword}",
    },

    {
      path: "/status/:id",
      method: Methods.PUT,
      handler: this.updateStatusById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "update",
        }),
      ],
      description: "Change store trader by id",
    },
    {
      path: "/register",
      method: Methods.POST,
      handler: this.register,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "create",
        }),
        uploadService.upload.single("image"),
      ],
      description: "register new admin",
    },

    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllManagers,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "managers",
          action: "read",
        }),
      ],
    },
  ];

  async findAllManagers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new AdminService();
      const data = await service.findAllManagers();
      super.sendSuccess(res, data.data, data.message);
    } catch (e) {
      console.log(e);
      super.sendError(res);
    }
  }

  async updateAdminStoreInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new AdminService();
      if (req.body.avatar) {
        req.body.avatar = JSON.parse(req.body.avatar);
      }
      req.body.address = JSON.parse(req.body.address);
      let imageTobeDelete = undefined;
      if (req.file) {
        imageTobeDelete = req.body.avatar;
        req.body.avatar = req.file;
      }

      const storeInfo = {
        fullName: req.body.fullName,
        store: {
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          intro: req.body.intro,
          about: req.body.about,
          avatar: req.body.avatar,
          address: req.body.address,
        },
      };
      const data = await service.updateAdmin(id, storeInfo);
      if (data.success) {
        FileUploadService.deleteFile(imageTobeDelete);
        super.sendSuccess(res, data.data, "Store info updated successfully");
      } else {
        super.sendError(res, data.message, data.data);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateAdminAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new AdminService();
      const data = await service.updateAdmin(id, { store: req.body });
      if (data.success) {
        super.sendSuccess(res, data.data, "Store address updated successfully");
      } else {
        super.sendError(res, data.message, data.data);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async changePasswordById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new AdminService();
      const data = await service.changePasswordById(id, req.body);
      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new AdminService();
      const data = await service.update(
        { _id: id },
        { isActive: req.body.isActive }
      );
      if (data.success) {
        super.sendSuccess(res, data.data, "Store status changed successfully.");
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      req.body.store = JSON.parse(req.body.store);

      if (req.file && req.body.store) {
        req.body.store = {
          ...req.body.store,
          avatar: req.file,
        };
      }

      req.body.password = await Utils.hashPassword(req.body.password);
      const service = new AdminService();
      const data = await service.register(req.body);
      if (data.success) super.sendSuccess(res, data.data, data.message);
      else super.sendError(res, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
