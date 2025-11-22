import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Address } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { AddressService, Token } from "../../services";

export default class ApiAddressController extends CRUDController<
  Address,
  AddressService
> {
  public version: string = "v1";
  constructor() {
    super(new AddressService());
  }
  public path: string = "/app/user/address";
  protected routes: IRoute[] = [
    {
      path: "/:id/:userid",
      method: Methods.DELETE,
      handler: this.deleteOneById,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "address",
          action: "delete",
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
    {
      path: "/:id/:userid",
      method: Methods.PUT,
      handler: this.updateOneById,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "address",
          action: "update",
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
    {
      path: "/:userid",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "address",
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
    {
      path: "/:userid",
      method: Methods.POST,
      handler: this.createAddress,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "address",
          action: "create",
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
      const service = new AddressService();
      const data = await service.find({ userId: userid });
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateOneById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new AddressService();
      const data = await service.updateOneById(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async createAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new AddressService();
      const data = await service.save(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
