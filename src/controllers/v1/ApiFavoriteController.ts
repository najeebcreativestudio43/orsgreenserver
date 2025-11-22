import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Favorite } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { FavoriteService, ProductService, Token } from "../../services";

export default class ApiFavoriteController extends CRUDController<
  Favorite,
  FavoriteService
> {
  public version: string = "v1";
  constructor() {
    super(new FavoriteService());
  }
  public path: string = "/app/user/favorites";
  protected routes: IRoute[] = [
    {
      path: "/:productId/:userid",
      method: Methods.DELETE,
      handler: this.removeFavorite,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "favorite",
          action: "delete",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "userid",
            },
          ],
        }),
      ],
    },
    {
      path: "/:userid",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "favorite",
          action: "read",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "userid",
            },
          ],
        }),
      ],
    },
    {
      path: "/:userid",
      method: Methods.POST,
      handler: this.createFavorite,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "favorite",
          action: "create",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "userid",
            },
          ],
        }),
      ],
    },
  ];

  async findAllByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userid } = req.params;
      const service = new FavoriteService();
      const productService = new ProductService();
      const favorites = await service.find({ userId: userid });
      const _ids = (favorites.data || []).map((fav: any) => fav.productId);

      const data = await productService.findAllWithImageFilter({
        _id: { $in: _ids },
      });
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async createFavorite(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new FavoriteService();
      const data = await service.createFavorite(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async removeFavorite(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new FavoriteService();
      const data = await service.removeFavorite(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
