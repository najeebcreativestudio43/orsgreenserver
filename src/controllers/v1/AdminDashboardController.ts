import { NextFunction, Request, Response } from "express";
import AccessControlMiddleware from "../../access/AccessControlMiddleware";
import Controller, { IRoute, Methods } from "../../server/Controller";
import { DashboardService, Token } from "../../services";

export default class AdminDashboardController extends Controller {
  public version: string = "v1";
  public path: string = "/admin/dashboard";
  protected routes: IRoute[] = [
    {
      path: "/sales",
      method: Methods.GET,
      handler: this.generateSaleReports,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "stats",
          action: "read",
        }),
      ],
      description: "?type={month,year,day}year={2021}&adminId={adminid}",
    },
    {
      path: "/stats",
      method: Methods.GET,
      handler: this.getDashboardStates,
      localMiddleware: [
        Token.verify,
        AccessControlMiddleware.check({
          resource: "stats",
          action: "read",
        }),
      ],
    },
  ];

  async getDashboardStates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new DashboardService();
      const data = await service.getDashboardStates(req);
      super.sendSuccess(res, data.data, data.message);
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async generateSaleReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const service = new DashboardService();
      const { type } = req.query;
      if (type === "year") {
        const data = await service.generateSaleReports(req);
        super.sendSuccess(res, data.data, data.message);
      } else if (type === "month") {
        const data = await service.generateSaleReportsByYearAndMonth(req);
        super.sendSuccess(res, data.data, data.message);
      } else if (type === "category") {
        const data = await service.generateSalesReportInCategoryByMonthYear(
          req
        );
        super.sendSuccess(res, data.data, data.message);
      } else if (type === "top-products") {
        const data = await service.generateTopProductSalesCountByMonthYear(req);
        super.sendSuccess(res, data.data, data.message);
      } else if (type === "daily-order-sales") {
        const data = await service.generateDailyOrderSalesByStartAndEndDate(
          req
        );
        super.sendSuccess(res, data.data, data.message);
      } else if (type === "products-sales") {
        const data = await service.generateProductSalesByStartAndEndDate(req);
        super.sendSuccess(res, data.data, data.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }
}
