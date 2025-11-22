import { NextFunction, Request, Response } from "express-serve-static-core";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";

import { Cart } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { CartService, Token } from "../../services";

export default class UserCartController extends CRUDController<
  Cart,
  CartService
> {
  public version: string = "v1";
  public path: string = "/cart";
  constructor() {
    super(new CartService());
  }
  protected routes: IRoute[] = [
    {
      path: "/clear/:id/:userid",
      method: Methods.DELETE,
      handler: this.clearCartItems,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "cart",
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
      path: "/user/:id",
      method: Methods.GET,
      handler: this.findByUserId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "cart",
          action: "read",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "_id",
            },
            {
              source: "params",
              key: "id",
            },
          ],
        }),
      ],
    },

    {
      path: "/:id/:sku/:userid",
      method: Methods.DELETE,
      handler: this.removeCartItemByIdAndSku,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "cart",
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
      path: "/:id/:userid",
      method: Methods.POST,
      handler: this.addItemById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "cart",
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
      path: "/:id/:userid",
      method: Methods.PUT,
      handler: this.updateItemsById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "cart",
          action: "update",
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

  async findByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new CartService();
      const data = await service.findOneOrCreateByUserId(id);

      super.sendSuccess(res, data.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async addItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new CartService();
      const data = await service.addItem(id, req.body);

      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async removeCartItemByIdAndSku(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, sku } = req.params;
      const service = new CartService();
      const data = await service.removeItemByIdAndSku(id, sku);

      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async clearCartItems(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new CartService();
      const data = await service.cleartItems(id);
      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateItemsById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new CartService();
      const data = await service.updateItemsById(id, req.body.items);

      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
