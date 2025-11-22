import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { EntityType, WhichUser } from "../../models/Notification.class";
import NotificationUtils from "../../notifications/NotificationUtils";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { OrderService, Token } from "../../services";

export default class ApiUserOrderController extends Controller {
  public version: string = "v1";
  public path: string = "/app/user/orders";
  protected routes: IRoute[] = [
    {
      path: "/item/:userid/:orderid/:itemid",
      method: Methods.DELETE,
      handler: this.deleteOrderItem,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "orderItem",
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
      path: "/item/:userid/:orderid",
      method: Methods.POST,
      handler: this.addOrderItem,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "orderItem",
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
    {
      path: "/item/:userid/:orderid",
      method: Methods.PUT,
      handler: this.updateOrderItem,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "orderItem",
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
    {
      path: "/:userid/:orderid",
      method: Methods.PUT,
      handler: this.updateOrderStatusById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "order",
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
    {
      path: "/:userid/:orderid",
      method: Methods.GET,
      handler: this.findOneByOrderId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "order",
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
      handler: this.createOrder,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "order",
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
    {
      path: "/:userid",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "order",
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
  ];

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new OrderService();
      const data = await service.createOrder(req);
      if (data.success) {
        await NotificationUtils.createOrderNotification(
          req,
          data.data,
          EntityType.ORDER_NEW,
          [data.data.adminId],
          data.data?.userId,
          WhichUser.User
        );

        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findAllByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userid } = req.params;
      const service = new OrderService();
      const data = await service.findOrderWithProductAndUserDetail({
        userId: Types.ObjectId(userid),
      });
      super.sendSuccess(res, data, "User Orders List");
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async addOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new OrderService();
      const data = await service.addOrderItem(req);
      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new OrderService();
      const data = await service.updateOrderItem(req);
      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async deleteOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new OrderService();
      const data = await service.deleteOrderItem(req);
      if (data.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findOneByOrderId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userid, orderid } = req.params;
      console.log("userid", userid);
      console.log("userid", userid);
      const service = new OrderService();
      const data = await service.findOrderWithProductAndUserDetail({
        userId: Types.ObjectId(userid),
        _id: parseInt("" + orderid),
      });
      if (data.length > 0) {
        super.sendSuccess(res, data[0], "Order detail");
      } else {
        super.sendError(res, "No order found");
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async updateOrderStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderid, userid } = req.params;
      const service = new OrderService();
      const data = await service.updateOrderStatusById(req, {
        userId: Types.ObjectId(userid),
        _id: parseInt(orderid),
      });
      if (req.body.status === "received" && data.data) {
        await NotificationUtils.createOrderNotification(
          req,
          data.data,
          EntityType.ORDER_RECEIVED,
          [data.data.adminId],
          data.data?.userId,
          WhichUser.User
        );
      }

      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
