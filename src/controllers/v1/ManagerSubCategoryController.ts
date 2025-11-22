import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { SubCategory } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import {
  ProductCategoryService,
  SubCategoryService,
  Token,
} from "../../services";

export default class ManagerSubCategoryController extends CRUDController<
  SubCategory,
  SubCategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new SubCategoryService());
  }
  public path: string = "/manager/sub-category";
  protected routes: IRoute[] = [
    {
      path: "/product-category/:subcategoryid/:adminid",
      method: Methods.GET,
      handler: this.findAllProductCategoriesBySubCategoryId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "productcategory",
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
      description: "Find all product categories by subcategoryid",
    },

    {
      path: "/:adminid/:id",
      method: Methods.PUT,
      handler: this.updateOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "subcategory",
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
          resource: "subcategory",
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
          resource: "subcategory",
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
          resource: "subcategory",
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
      const service = new SubCategoryService();
      const data = await service.create(req.body);
      const subcategory = await service.findOneWithImageById(data.data._id);
      super.sendSuccess(res, subcategory || undefined, data?.message);
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
      const service = new SubCategoryService();
      const data = await service.findAll({ adminId: Types.ObjectId(adminid) });
      super.sendSuccess(res, data.data, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllProductCategoriesBySubCategoryId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, subcategoryid } = req.params;
      const service = new ProductCategoryService();
      const data = await service.find({
        adminId: adminid,
        subCategoryId: subcategoryid,
      });
      super.sendSuccess(
        res,
        data.data,
        "Product categories list by sub category id"
      );
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
      const service = new SubCategoryService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        super.sendSuccess(res, data.data, "SubCategory deleted successfully");
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
      const service = new SubCategoryService();
      const data = await service.update({ _id: id }, req.body);
      if (data.success) {
        const subcategory = await service.findOneWithImageById(id);
        super.sendSuccess(
          res,
          subcategory || undefined,
          "SubCategory updated successfully"
        );
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
