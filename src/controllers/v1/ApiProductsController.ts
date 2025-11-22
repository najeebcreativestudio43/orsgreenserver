import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { OrderService, ProductService, Token } from "../../services";

export default class ApiProductsController extends Controller {
  public version: string = "v1";
  public path: string = "/app/products";
  protected routes: IRoute[] = [
    {
      path: "/discounts",
      method: Methods.GET,
      handler: this.findAllByDiscount,
      localMiddleware: [Token.verifyApiKey],
      description: "Find all discount products with limit/all",
    },
    {
      path: "/popular",
      method: Methods.GET,
      handler: this.findAllPopularProducts,
      localMiddleware: [Token.verifyApiKey],
      description: "Find all popular products",
    },
    {
      path: "/:productid",
      method: Methods.GET,
      handler: this.findOneByProductId,
      localMiddleware: [Token.verifyApiKey],
      description: "Find one product by id with detail",
    },
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllWithDetailsByPage,
      localMiddleware: [Token.verifyApiKey],
      description: "Products by pages",
    },
  ];

  async findAllByDiscount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, limit } = req.query;
      const service = new ProductService();
      const numberLimit = limit ? parseInt("" + limit) : undefined;
      console.log(numberLimit);
      const options: any[] = [
        {
          $sort: { "sku.price.discount": -1 },
        },
      ];

      if (numberLimit) {
        options.push({ $limit: numberLimit });
      }

      const data = await service.findProductsWithDetails(
        {
          $and: [{ isActive: true }, { "sku.price.discount": { $gt: 0 } }],
        },
        options
      );
      super.sendSuccess(res, data.data, data?.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllPopularProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, limit } = req.query;
      const numberLimit = limit ? parseInt("" + limit) : undefined;
      const options: any[] = [
        // {
        //   $sort: { "sku.price.discount": -1 },
        // },
      ];
      const stages: any[] = [{ $sort: { count: 1 } }];
      if (numberLimit) {
        options.push({ $limit: numberLimit });
        stages.push({ $limit: numberLimit });
      }

      const service = new ProductService();
      const orderService = new OrderService();

      const ids = await orderService.findAllPopularProductIds(stages);

      const data = await service.findProductsWithDetails(
        {
          $and: [{ isActive: true }, { _id: { $in: ids } }],
        },
        options
      );
      super.sendSuccess(res, data.data, "Popular products");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllWithDetailsByPage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, title, active } = req.query;
      title = title ? "" + title : undefined;
      const service = new ProductService();
      const filter: any = {
        isActive: true,
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

      const data = await service.findAllWithImageFilter(
        filter,
        parseInt("" + page),
        parseInt("" + size)
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
      const { productid } = req.params;

      const service = new ProductService();
      const data = await service.findOneWithFullInfoById(productid);
      super.sendSuccess(res, data, "Product detail");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
