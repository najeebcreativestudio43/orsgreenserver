import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Brand } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { BrandService, ProductService, Token } from "../../services";
import { Types } from "mongoose";

export default class ApiBrandsController extends CRUDController<
  Brand,
  BrandService
> {
  public version: string = "v1";
  constructor() {
    super(new BrandService());
  }
  public path: string = "/app/brands";
  protected routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllActive,
      localMiddleware: [Token.verifyApiKey],
    },
    {
      path: "/products",
      method: Methods.GET,
      handler: this.findAllProductsByBrandIdAndPaging,
      localMiddleware: [Token.verifyApiKey],
    },
  ];

  async findAllActive(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      try {
        let { page, size, title, active, limit } = req.query;
        title = title ? "" + title : undefined;
        limit = limit ? limit : undefined;
        const filter: any = {
          isActive: true,
        };
        if (title) filter.$text = { $search: `\"${title}\"` };
        const service = new BrandService();
        if (limit) {
          const data = await service.findAllByPaging(
            filter,
            undefined,
            undefined,
            [{ $limit: parseInt("" + limit) }]
          );
          super.sendSuccess(res, data.data, data?.message);
        } else {
          const data = await service.findAllByPaging(
            filter,
            parseInt("" + page),
            parseInt("" + size)
          );
          super.sendSuccess(res, data.data, data?.message);
        }
      } catch (err: any) {
        super.sendError(res, err.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findAllProductsByBrandIdAndPaging(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, title, active, brandid, limit } = req.query;
      title = title ? "" + title : undefined;
      limit = limit ? limit : undefined;
      const service = new ProductService();
      const filter: any = {
        isActive: true,
        brandId: Types.ObjectId("" + brandid),
      };
      if (title) filter.$text = { $search: `\"${title}\"` };

      if (limit) {
        const data = await service.findProductsWithDetails(filter, [
          { $limit: parseInt("" + limit) },
        ]);
        super.sendSuccess(
          res,
          data.data,
          "Brand product list without pagination"
        );
      } else {
        const data = await service.findAllWithImageFilter(
          filter,
          parseInt("" + page),
          parseInt("" + size)
        );
        super.sendSuccess(res, data.data, "Brand Product list");
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
