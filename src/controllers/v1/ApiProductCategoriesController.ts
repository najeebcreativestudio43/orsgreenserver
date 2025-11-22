import { NextFunction, Request, Response } from "express";
import { ProductCategory } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { ProductCategoryService, ProductService, Token } from "../../services";
import { FilterQuery, Types } from "mongoose";

export default class ApiProductCategoriesController extends CRUDController<
  ProductCategory,
  ProductCategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new ProductCategoryService());
  }
  public path: string = "/app/product-categories";
  protected routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllActiveByFilter,
      localMiddleware: [Token.verifyApiKey],
    },
    {
      path: "/products",
      method: Methods.GET,
      handler: this.findAllProductsByProductCategoryIdAndPaging,
      localMiddleware: [Token.verifyApiKey],
    },
  ];

  async findAllActiveByFilter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      try {
        let { subcategoryid } = req.query;
        subcategoryid = subcategoryid ? "" + subcategoryid : undefined;
        const service = new ProductCategoryService();
        let filter: FilterQuery<ProductCategory> = {
          isActive: true,
        };
        filter = subcategoryid
          ? { ...filter, subCategoryId: Types.ObjectId(subcategoryid) }
          : filter;

        const data = await service.findAllActiveByFilter(filter);
        super.sendSuccess(res, data.data, data?.message);
      } catch (err: any) {
        super.sendError(res, err.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findAllProductsByProductCategoryIdAndPaging(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, title, active, productcategoryid, limit } = req.query;
      title = title ? "" + title : undefined;
      limit = limit ? limit : undefined;
      const service = new ProductService();
      const filter: any = {
        isActive: true,
        productCategoryId: Types.ObjectId("" + productcategoryid),
      };
      if (title) filter.$text = { $search: `\"${title}\"` };

      if (limit) {
        const data = await service.findProductsWithDetails(filter, [
          { $limit: parseInt("" + limit) },
        ]);
        super.sendSuccess(res, data.data, "Product list without pagination");
      } else {
        console.log("findAllProductsByProductCategoryIdAndPaging");
        const data = await service.findAllWithImageFilter(
          filter,
          parseInt("" + page),
          parseInt("" + size)
        );
        super.sendSuccess(res, data.data, "Product list");
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
