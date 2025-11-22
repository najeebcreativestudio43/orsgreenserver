import { NextFunction, Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Purchase, PurchaseModel } from "../../models";
import { EntityType, WhichUser } from "../../models/Notification.class";
import NotificationUtils from "../../notifications/NotificationUtils";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { OrderService, PurchaseService, Token } from "../../services";

export default class ManagerPurchaseController extends Controller {
  public version: string = "v1";
  public path: string = "/manager/purchase";
  protected routes: IRoute[] = [
    {
      path: "/item/:adminid/:purchaseid/:itemid",
      method: Methods.DELETE,
      handler: this.removePurchaseItemById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      description: "delete purchase item by purchaseid and itemid",
    },
    {
      path: "/item/:adminid/:purchaseid",
      method: Methods.POST,
      handler: this.addNewPurchaseItem,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      description: "add new purchase item",
    },
    {
      path: "/item/:adminid/:id",
      method: Methods.PUT,
      handler: this.updatePurchaseItemById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      description: "update purhcase item by adminid , purhcaseid and item id",
    },
    {
      path: "/next-serialno/:adminid",
      method: Methods.GET,
      handler: this.findNextSerialNo,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      path: "/:adminid/:serialNo",
      method: Methods.GET,
      handler: this.findOneBySerialNo,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      method: Methods.POST,
      handler: this.createPurchase,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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
      path: "/:adminid",
      method: Methods.GET,
      handler: this.findAllPurchaseByAdminId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "purchase",
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

  async createPurchase(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new PurchaseService();
      const data = await service.createPurchase(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findAllPurchaseByAdminId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid } = req.params;
      let { page, size, startDate, endDate, serialNo } = req.query;
      let start = startDate ? "" + startDate : undefined;
      let sNo = serialNo ? parseInt(serialNo as any) : undefined;
      let end = endDate ? "" + endDate : undefined;
      const service = new PurchaseService();
      const filter: FilterQuery<Purchase> = {
        adminId: Types.ObjectId(adminid),
      };
      if (sNo) {
        filter.serialNo = sNo;
      }
      if (start && end) {
        filter.createdAt = { $gte: new Date(start), $lt: new Date(end) };
      }

      const data = await service.pagination(
        parseInt("" + page),
        parseInt("" + size),
        filter
      );
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findOneBySerialNo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adminid, serialNo } = req.params;
      const service = new PurchaseService();
      const data = await service.filterPurhcase({
        adminId: Types.ObjectId(adminid),
        serialNo: parseInt(serialNo),
      });
      if (data.length > 0) {
        super.sendSuccess(res, data[0], "Purchases detail");
      } else {
        super.sendError(res, "No Purchase history found");
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async findNextSerialNo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await PurchaseModel.count();
      super.sendSuccess(res, count + 1, "Next serial no");
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async updatePurchaseItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new PurchaseService();
      const data = await service.updatePurchaseItemById(req);
      if (data.success) {
        super.sendSuccess(res, data?.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async removePurchaseItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new PurchaseService();
      const data = await service.removePurhcaseItemById(req);
      if (data.success) {
        super.sendSuccess(res, data?.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async addNewPurchaseItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new PurchaseService();
      const data = await service.addNewPurchaesItem(req);
      if (data.success) {
        super.sendSuccess(res, data?.data, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }
}
