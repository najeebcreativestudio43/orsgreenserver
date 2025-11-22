import { NextFunction, Request, Response } from "express-serve-static-core";
import Controller, { IRoute, Methods } from "./../../server/Controller";
import { ProductService } from "../../services";

type IQueryParams = {
  page: number;
  size: number;
};
export default class ProductController extends Controller {
  public version: string = "v1";
  public path: string = "/product";
  protected routes: IRoute[] = [
    {
      path: "/colors",
      method: Methods.GET,
      handler: this.findAllDistinctsColorsWithOccurence,
      localMiddleware: [],
    },
    {
      path: "/tags",
      method: Methods.GET,
      handler: this.findAllDistinctsTags,
      localMiddleware: [],
    },
    {
      path: "/:id",
      method: Methods.GET,
      handler: this.findOneByIdAndActive,
      localMiddleware: [],
    },
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllByActive,
      localMiddleware: [],
    },
  ];

  async findAllByActive(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { page, size, category, color, minprice, maxprice, tag, search } =
        req.query;
      let searchText = search ? "" + search : undefined;
      let filterTags = tag ? ["" + tag] : [];
      console.log(filterTags);
      let minPrice = minprice ? parseInt("" + minprice) : 0;
      let maxPrice = maxprice ? parseInt("" + maxprice) : 0;
      let filterCategories: string[] = [];
      let filterColors: string[] = [];
      if (page === undefined) {
        page = "1";
      } else if (Number(page) <= 0) {
        page = "1";
      }
      if (size === undefined) size = "2";
      if (category) {
        if (!Array.isArray(category)) filterCategories = ["" + category];
        else filterCategories = [...(category as string[])];
      }

      if (color) {
        if (!Array.isArray(color)) filterColors = ["" + color];
        else filterColors = [...(color as string[])];
      }
      const service = new ProductService();
      const data = await service.pagination(
        Number(page),
        Number(size),
        filterCategories,
        filterColors,
        minPrice,
        maxPrice,
        filterTags,
        searchText
      );
      super.sendSuccess(res, data.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findOneByIdAndActive(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new ProductService();
      // const data = await service.findOneWithCategoriesByIdAndActive(id);
      super.sendSuccess(res, {}, "");
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findAllDistinctsColorsWithOccurence(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new ProductService();
      const data = await service.findAllDistinctsColorsWithOccurence();
      super.sendSuccess(res, data.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findAllDistinctsTags(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new ProductService();
      const data = await service.findAllDistinctsTags();
      super.sendSuccess(res, data.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
