import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Favorite } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { FavoriteService, ProductService, Token } from "../../services";

export default class ApiCartController extends Controller {
  public version: string = "v1";
  constructor() {
    super();
  }
  public path: string = "/app/carts";
  protected routes: IRoute[] = [
    {
      path: "/products",
      method: Methods.POST,
      handler: this.findAllProductByIds,
      localMiddleware: [
        Token.verifyApiKey,

        AccessControlMiddleware.check({
          resource: "cart",
          action: "read",
        }),
      ],
    },
  ];

  async findAllProductByIds(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ids } = req.body;
      const service = new ProductService();
      const data = await service.findAllWithImageFilter({
        _id: { $in: ids },
      });
      super.sendSuccess(res, data.data, "Cart Products list.");
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
