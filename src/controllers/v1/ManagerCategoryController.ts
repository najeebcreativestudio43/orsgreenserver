import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Category } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { CategoryService, SubCategoryService, Token } from "../../services";

export default class ManagerCategoryController extends CRUDController<
  Category,
  CategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new CategoryService());
  }
  public path: string = "/manager/category";
  protected routes: IRoute[] = [
    {
      path: "/sub-category/:categoryid/:adminid",
      method: Methods.GET,
      handler: this.findAllSubCategoriesByCategoryId,
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
      description: "Find all product categories by subcategoryid",
    },
    {
      path: "/:adminid/:id",
      method: Methods.PUT,
      handler: this.updateOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "category",
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
          resource: "category",
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
          resource: "category",
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
          resource: "category",
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

  async findAllSubCategoriesByCategoryId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, categoryid } = req.params;
      const service = new SubCategoryService();
      const data = await service.find({
        adminId: adminid,
        categoryId: categoryid,
      });
      super.sendSuccess(res, data.data, "Sub categories list by category id");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = new CategoryService();
      const data = await service.create(req.body);
      const category = await service.findOneWithImageById(data.data._id);
      super.sendSuccess(res, category || undefined, data?.message);
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
      const service = new CategoryService();
      const data = await service.findAll(adminid);
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
      const service = new CategoryService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        super.sendSuccess(res, data.data, "Category deleted successfully");
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
      const service = new CategoryService();
      const data = await service.update({ _id: id }, req.body);
      if (data.success) {
        const category = await service.findOneWithImageById(id);
        super.sendSuccess(
          res,
          category || undefined,
          "Category updated successfully"
        );
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
