import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import { Address } from "../../models";
import { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { AddressService, Token } from "../../services";

export default class ManagerAddressController extends CRUDController<
  Address,
  AddressService
> {
  public version: string = "v1";
  constructor() {
    super(new AddressService());
  }
  public path: string = "/manager/user/address";
  protected routes: IRoute[] = [
    {
      path: "/:userid",
      method: Methods.GET,
      handler: this.findAllByUserId,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "address",
          action: "read",
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
      const service = new AddressService();
      const data = await service.find({ userId: userid });
      super.sendSuccess(res, data.data, "User addresses list");
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
