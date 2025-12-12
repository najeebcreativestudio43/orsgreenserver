import { NextFunction, Request, Response } from "express";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { EmailService } from "../../services";

export default class EmailController extends Controller {
  public version: string = "v1";
  public path: string = "/email";
  protected routes: IRoute[] = [
    {
      path: "/send",
      method: Methods.POST,
      handler: this.sendEmail,
      localMiddleware: [],
    },
  ];

  async sendEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await EmailService.sendEmail(req.body.email, req.body.otp);
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
