import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { ProductCategory } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { ProductCategoryService, Token } from "../../services";

export default class ManagerProductCategoryController extends CRUDController<
  ProductCategory,
  ProductCategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new ProductCategoryService());
  }
  public path: string = "/manager/product-category";
  protected routes: IRoute[] = [
    {
      path: "/:adminid/:id",
      method: Methods.DELETE,
      handler: this.deleteOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "productcategory",
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
      path: "/:adminid/:id",
      method: Methods.PUT,
      handler: this.updateOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "productcategory",
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
      description: "update admin ProductCategory",
    },
    {
      path: "/:adminid",
      method: Methods.GET,
      handler: this.findAllWithCategoryAndSubCategory,
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
    },
    {
      path: "/:adminid",
      method: Methods.POST,
      handler: this.save,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "productcategory",
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
      description: "create admin ProductCategory",
    },
  ];

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = new ProductCategoryService();
      const data = await service.create(req.body);
      const category = await service.findOneWithCategoryAndSubCategory(
        data.data._id
      );
      super.sendSuccess(
        res,
        category || undefined,
        "Product category successfully saved"
      );
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllWithCategoryAndSubCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      const service = new ProductCategoryService();
      const data = await service.findAll({ adminId: adminid });
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
      const service = new ProductCategoryService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        super.sendSuccess(
          res,
          data.data,
          "Product Category deleted successfully"
        );
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
      const service = new ProductCategoryService();
      const data = await service.update({ _id: id }, req.body);
      if (data.success) {
        const category = await service.findOneWithCategoryAndSubCategory(id);
        super.sendSuccess(
          res,
          category || undefined,
          "Product Category updated successfully"
        );
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
