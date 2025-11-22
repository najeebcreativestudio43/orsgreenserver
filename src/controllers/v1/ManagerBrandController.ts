import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Brand } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { BrandService, Token } from "../../services";

export default class ManagerBrandController extends CRUDController<
  Brand,
  BrandService
> {
  public version: string = "v1";
  constructor() {
    super(new BrandService());
  }
  public path: string = "/manager/brand";
  protected routes: IRoute[] = [
    {
      path: "/:adminid/:id",
      method: Methods.PUT,
      handler: this.updateOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "brand",
          action: "update",
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
      path: "/:adminid/:id",
      method: Methods.DELETE,
      handler: this.deleteOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "brand",
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
      handler: this.findAllWithImage,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "brand",
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
    {
      path: "/:adminid",
      method: Methods.POST,
      handler: this.save,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "brand",
          action: "create",
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

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = new BrandService();
      const data = await service.create(req.body);
      const brand = await service.findOneWithImageById(data.data._id);
      super.sendSuccess(res, brand || undefined, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllWithImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      const service = new BrandService();
      const data = await service.findAll({ adminId: Types.ObjectId(adminid) });
      super.sendSuccess(res, data.data, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async deleteOne(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new BrandService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        super.sendSuccess(res, data.data, "Brand deleted successfully");
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async updateOne(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new BrandService();
      const data = await service.update({ _id: id }, req.body);
      if (data.success) {
        const brand = await service.findOneWithImageById(id);
        super.sendSuccess(
          res,
          brand || undefined,
          "Brand updated successfully"
        );
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
