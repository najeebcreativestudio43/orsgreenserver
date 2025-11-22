import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Favorite, SubCategory } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { SubCategoryService, Token } from "../../services";

export default class ApiSubCategoriesController extends CRUDController<
  SubCategory,
  SubCategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new SubCategoryService());
  }
  public path: string = "/app/sub-categories";
  protected routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.findAllActive,
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
        const service = new SubCategoryService();
        const data = await service.findAll({ isActive: true });
        super.sendSuccess(res, data.data, data?.message);
      } catch (err: any) {
        super.sendError(res, err.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
