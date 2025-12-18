import { NextFunction, Request, Response } from "express";
import { Image, User } from "../../models";
import Controller, { IRoute, Methods } from "../../server/Controller";
import CRUDController from "../../server/CRUDController";
import { FileUploadService, Token, UserService } from "../../services";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
const uploadService = new FileUploadService("user");
export default class UserController extends CRUDController<User, UserService> {
  public version: string = "v1";
  constructor() {
    super(new UserService());
  }
  path = "/app/user";
  routes: Array<IRoute> = [
    {
      path: "/email-signup",
      method: Methods.POST,
      handler: this.emailSignup,
      localMiddleware: [Token.verifyApiKey],
      description: "Register user using email and password",
    },
    {
      path: "/email-login",
      method: Methods.POST,
      handler: this.emailLogin,
      localMiddleware: [Token.verifyApiKey],
      description: "Login using email and password",
    },
    {
      path: "/forgot-password",
      method: Methods.POST,
      handler: this.forgotPassword,
      localMiddleware: [Token.verifyApiKey],
      description: "Send OTP to email for password reset",
    },
    {
      path: "/reset-password",
      method: Methods.POST,
      handler: this.resetPassword,
      localMiddleware: [Token.verifyApiKey],
      description: "Reset password using OTP",
    },

    {
      path: "/verify-phone-otp",
      method: Methods.POST,
      handler: this.verifyPhoneOTP,
      localMiddleware: [Token.verifyApiKey],
      description: "Verify Phone OTP by user id and otp",
    },

    {
      path: "/register-login",
      method: Methods.POST,
      handler: this.register,
      localMiddleware: [Token.verifyApiKey],
      description: "register new user",
    },
    {
      path: "/delete-by-email",
      method: Methods.DELETE,
      handler: this.deleteUserByEmail,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "user",
          action: "delete",
          checkOwnerShip: true,
          operands: [
            {
              source: "user",
              key: "email",
            },
            {
              source: "body",
              key: "email",
            },
          ],
        }),
      ],
      description: "Delete user by email",
    },

    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateUser,
      localMiddleware: [
        Token.verifyApiKey,
        Token.verify,
        AccessControlMiddleware.check({
          resource: "user",
          action: "update",
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
        uploadService.upload.single("image"),
      ],
      description: "Update user Info",
    },
  ];
  // routes: Array<IRoute> = [

  // ];

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.registerOrLogin(req.body);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async verifyPhoneOTP(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.verifyPhoneOtp(req.body);
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

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.updateUser(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async updateUserImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.updateUser(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async changeAvatarById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      //super.sendSuccess(res, req.file, "Uploaded");

      const service = new UserService();
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async emailSignup(req: Request, res: Response): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.registerWithEmail(req.body);

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

  async emailLogin(req: Request, res: Response): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.loginWithEmail(req.body);
      console.log(data, "data");
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

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.forgotPassword(req.body);

      if (data.success) {
        super.sendSuccess(res, null, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const service = new UserService();
      const data = await service.resetPassword(req.body);

      if (data.success) {
        super.sendSuccess(res, null, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async deleteUserByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        return super.sendError(res, "Email is required") as any;
      }

      const service = new UserService();
      const data = await service.deleteUserByEmail(email);

      if (data.success) {
        super.sendSuccess(res, null, data.message);
      } else {
        super.sendError(res, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
