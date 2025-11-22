import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Payment } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { PaymentService, Token } from "../../services";

export default class UserPaymentController extends CRUDController<
  Payment,
  PaymentService
> {
  public version: string = "v1";
  constructor() {
    super(new PaymentService());
  }
  public path: string = "/payment";
  protected routes: IRoute[] = [
    {
      path: "/user/:id",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "payment",
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
      path: "/user/:id",
      method: Methods.POST,
      handler: this.create,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "payment",
          action: "create",
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
      path: "/:id/:userid",
      method: Methods.DELETE,
      handler: this.deleteOneById,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "payment",
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
  ];

  async findAllByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const service = new PaymentService();
      const data = await service.find({ userId: id });
      super.sendSuccess(res, data.data, data.message);
    } catch (err) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
