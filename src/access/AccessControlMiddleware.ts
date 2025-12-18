import { Access, AccessControl } from "accesscontrol";
import { NextFunction, Request, Response } from "express";
import accessControl from "./AccessControl";
export interface IOperand {
  source: string;
  key: string;
}
export interface IAction {
  any: string;
  own: string;
}
export interface IOptions {
  resource: string;
  action: string;
  checkOwnerShip?: boolean;
  operands?: IOperand[];
}
class AccessControlMiddleware {
  public static check(options: IOptions) {
    return (req: any, res: Response, next: NextFunction) => {
      const actions: IAction = { any: "", own: "" };
      const { action, operands, resource, checkOwnerShip } = options;

      switch (action) {
        case "create":
          actions.any = "createAny";
          actions.own = "createOwn";
          break;

        case "update":
          actions.any = "updateAny";
          actions.own = "updateOwn";
          break;

        case "read":
          actions.any = "readAny";
          actions.own = "readOwn";
          break;

        case "delete":
          actions.any = "deleteAny";
          actions.own = "deleteOwn";
          break;

        default:
          return next(new Error("invalid action"));
      }

      const role = req.user.role || "guest";

      let permission: any = {};
      permission = accessControl.can(role);

      if (checkOwnerShip && operands) {
        if (operands.length !== 2) {
          return next(new Error("must be two operands to check ownership"));
        }
        const firstOperand = req[operands[0].source][operands[0].key];
        const secondOperand = req[operands[1].source][operands[1].key];

        if (firstOperand?.toString() === secondOperand?.toString()) {
          permission = permission[actions.own](resource);
        } else {
          permission = permission[actions.any](resource);
        }
      } else {
        permission = permission[actions.any](resource);
      }

      if (permission.granted) {
        const data = AccessControl.filter(req.body, permission.attributes);
        req.body = data;
        return next();
      } else {
        return res.status(401).json({
          message: `[${role}] You don't have enough permission to perform this action`,
        });
      }
    };
  }
}

export default AccessControlMiddleware;
