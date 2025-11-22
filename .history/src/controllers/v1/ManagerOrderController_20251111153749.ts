import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { EntityType, WhichUser } from "../../models/Notification.class";
import NotificationUtils from "../../notifications/NotificationUtils";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { OrderService, Token } from "../../services";

export default class ManagerOrderController extends Controller {
  public version: string = "v1";
  public path: string = "/manager/order";
  protected routes: IRoute[] = [
    {
      path: "/item/:adminid/:orderid/:itemid",
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
    {
      path: "/item/:adminid/:orderid",
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
    {
      path: "/item/:adminid/:orderid",
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
    {
      path: "/:adminid/:orderid",
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
    {
      path: "/:adminid/:orderid",
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
    {
      path: "/:adminid",
      method: Methods.GET,
      handler: this.findAllOrdersByAdminId,
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
              key: "adminid",
            },
          ],
        }),
      ],
    },
  ];
  async findAllOrdersByAdminId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      let { page, size, status, startDate, endDate } = req.query;
      let orderStatus = status ? "" + status : undefined;
      let start = startDate ? "" + startDate : undefined;
      let end = endDate ? "" + endDate : undefined;
      const service = new OrderService();
      const filter: any = { adminId: Types.ObjectId(adminid) };
      if (orderStatus) {
        filter.status = orderStatus;
      }
      if (start && end) {
        filter.createdAt = { $gte: new Date(start), $lt: new Date(end) };
      }
      if (page !== undefined && size !== undefined) {
        const data = await service.pagination(
          parseInt("" + page),
          parseInt("" + size),
          filter
        );
        super.sendSuccess(res, data.data, data.message);
      } else {
        //get All orders by
        const data = await service.findAllOrdersByFilter(filter);
        super.sendSuccess(res, data.data, data.message);
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
      const { adminid, orderid } = req.params;
      const service = new OrderService();
      const data = await service.findOrderWithProductAndUserDetail({
        adminId: Types.ObjectId(adminid),
        _id: parseInt(orderid),
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
      const { orderid, admindid } = req.params;
      const { status } = req.body;
      const service = new OrderService();
      const filter = {
        _id: parseInt("" + orderid),
      };
      const data = await service.updateOrderStatusById(req, filter);
      const getEntityTypeByOrderStatus = (
        status: string
      ): EntityType | undefined => {
        switch (status) {
          case "pending":
            return EntityType.ORDER_PENDING;
          case "progress":
            return EntityType.ORDER_PROGRESS;
          case "delivered":
            return EntityType.ORDER_DELIVERED;
          case "declined":
            return EntityType.ORDER_DECLINED;
          default:
            return undefined;
        }
      };

      if (status !== "new" && data.data) {
        const entityType = getEntityTypeByOrderStatus(status);
        if (entityType) {
          await NotificationUtils.createOrderNotification(
            req,
            data.data,
            entityType,
            [data.data.userId],
            data.data?.adminId,
            WhichUser.Admin
          );
        }
      }

      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
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
      console.log("request body", req);
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
}
