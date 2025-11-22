import { NextFunction, query, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Product } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { ProductService, Token } from "../../services";

export default class ManagerProductController extends CRUDController<
  Product,
  ProductService
> {
  public version: string = "v1";
  constructor() {
    super(new ProductService());
  }
  public path: string = "/manager/product";
  protected routes: IRoute[] = [
    {
      path: "/:adminid/:id",
      method: Methods.PUT,
      handler: this.updateOne,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
          resource: "product",
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
      path: "/brand/:adminid/:brandid",
      method: Methods.GET,
      handler: this.findAllByBrand,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
      path: "/category/:adminid/:categoryid",
      method: Methods.GET,
      handler: this.findAllByCategory,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
      path: "/sub-category/:adminid/:subcategoryid",
      method: Methods.GET,
      handler: this.findAllBySubCategory,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
      path: "/product-category/:adminid/:productcategoryid",
      method: Methods.GET,
      handler: this.findAllByProductCategory,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
      path: "/:adminid/:productid",
      method: Methods.GET,
      handler: this.findOneByProductId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
      method: Methods.GET,
      handler: this.findAllWithImage,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "product",
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
          resource: "product",
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
      const service = new ProductService();
      const data = await service.create(req.body);
      const product = await service.findOneWithFullInfoById(data.data._id);
      super.sendSuccess(res, product || undefined, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async searchAllWithImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      const { search } = req.query;
      const service = new ProductService();
      const words = (search?.toString() || "").split(" ");
      var expression = new RegExp(
        words
          .map(function (word) {
            return "\\b" + word + "\\b";
          })
          .join("|")
      );
      if (search) {
        const data = await service.findAllWithImageFilter({
          adminId: Types.ObjectId(adminid),
          title: expression,
        });
        super.sendSuccess(res, data.data, data?.message);
      } else {
        super.sendSuccess(res, [], "Product List");
      }
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

      let { page, size, title, active } = req.query;
      title = title ? "" + title : undefined;
      const filterActive = active ? active === "true" : undefined;
      const service = new ProductService();
      const filter: any = {
        adminId: Types.ObjectId(adminid),
      };
      const words = (title?.toString() || "").split(" ");
      var expression = new RegExp(
        words
          .map(function (word) {
            return "\\b" + word + "\\b";
          })
          .join("|")
      );
      if (title) filter.title = expression;
      if (filterActive !== undefined) filter.isActive = filterActive;

      const data = await service.findAllWithImageFilter(
        filter,
        page ? parseInt("" + page) : undefined,
        size ? parseInt("" + size) : undefined
      );
      super.sendSuccess(res, data.data, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findOneByProductId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, productid } = req.params;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        adminId: Types.ObjectId(adminid),
        _id: Types.ObjectId(productid),
      });
      if ((data.data || []).length > 0) {
        super.sendSuccess(res, data.data[0], "Product Detail");
      } else {
        super.sendError(res, "No such product");
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllByBrand(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, brandid } = req.params;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        adminId: Types.ObjectId(adminid),
        brandId: Types.ObjectId(brandid),
      });
      super.sendSuccess(res, data.data || [], "Brand product list");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, categoryid } = req.params;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        adminId: Types.ObjectId(adminid),
        categoryId: Types.ObjectId(categoryid),
      });
      super.sendSuccess(res, data.data || [], "Category product list");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllBySubCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, subcategoryid } = req.params;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        adminId: Types.ObjectId(adminid),
        subCategoryId: Types.ObjectId(subcategoryid),
      });
      super.sendSuccess(res, data.data || [], "Sub category product list");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllByProductCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, productcategoryid } = req.params;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        adminId: Types.ObjectId(adminid),
        productCategoryId: Types.ObjectId(productcategoryid),
      });
      super.sendSuccess(res, data.data || [], "Product category product list");
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
      const service = new ProductService();
      const data = await service.deleteOneById(id);
      if (data.success) {
        super.sendSuccess(res, data.data, "Product deleted successfully");
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
      const service = new ProductService();
      const data = await service.update({ _id: id }, req.body);
      if (data.success) {
        const product = await service.findOneWithFullInfoById(id);
        super.sendSuccess(res, product, "Product updated successfully");
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
