import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Category } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { CategoryService, Token } from "../../services";

export default class CategoryController extends CRUDController<
  Category,
  CategoryService
> {
  public version: string = "v1";
  constructor() {
    super(new CategoryService());
  }
  public path: string = "/category";
  protected routes: IRoute[] = [
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
      const service = new CategoryService();
      const data = await service.find({ isActive: true });

      super.sendSuccess(res, data.data, data?.message);
    } catch (err) {
      console.log(err);
      super.sendError(err);
    }
  }
}
