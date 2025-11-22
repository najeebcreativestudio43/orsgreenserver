import { NextFunction, Request, Response } from "express";
import { User } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { FileUploadService, Token, UserService } from "../../services";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import multer from "multer";
const uploadService = new FileUploadService("user");
export default class ManagerUserController extends CRUDController<
  User,
  UserService
> {
  public version: string = "v1";
  constructor() {
    super(new UserService());
  }
  path = "/manager/user";
  routes: Array<IRoute> = [
    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateUser,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "user",
          action: "update",
        }),
      ],
      description: "updateUser",
    },
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAll,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "user",
          action: "read",
        }),
      ],
      description: "find all users",
    },
  ];

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.findAllWithDefaultAddress();
      super.sendSuccess(res, data?.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new UserService();
      const data = await service.update({ _id: id }, req.body);
      const user = await service.findOneByUserIdWithDefaultAddress(
        data.data._id
      );
      super.sendSuccess(res, user, "User updated successfully.");
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
