import { Request } from "express";
import moment from "moment";
import { Types } from "mongoose";
import { IReturnData } from "../base";
import { OrderModel, ProductModel, UserModel } from "../models";
import Utils from "../Utils/Utils";

import * as OrderStateQueries from "./../quries/OrderStateQueries";
import * as Quries from "./../quries/Queries";

interface IOrderDashboardState {
  _id: string;
  count: number;
  percentage: number;
}

export default class DashboardService {
  public async getDashboardStatesByAdminId(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      const { adminid } = req.params;
      const { start, end } = req.query;

      const numberOfOrderLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
            adminId: Types.ObjectId(adminid),
          },
        },
        {
          $group: {
            _id: "Number of Orders",
            total: {
              $sum: 1,
            },
          },
        },
      ]);

      const numberOfCustomerLast30Days = await UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
          },
        },
        {
          $group: {
            _id: "Number of Customers",
            total: {
              $sum: 1,
            },
          },
        },
      ]);

      const totalSalesInLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
            status: "delivered",
          },
        },
        {
          $group: {
            _id: "Sales/Last 30 Days",
            total: {
              $sum: "$grandTotal",
            },
          },
        },
      ]);

      //const totalNumberOfProducts: number = await ProductModel.count();
      const totalProductSoldLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
            status: "delivered",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "Product Solds/Last 30 Days",
            total: {
              $sum: "$items.quantity",
            },
          },
        },
      ]);
      const customers =
        numberOfCustomerLast30Days.length > 0
          ? numberOfCustomerLast30Days[0]
          : { _id: "Number of Customers", total: 0 };
      const totalSales =
        totalSalesInLast30Days.length > 0
          ? totalSalesInLast30Days[0]
          : { _id: "Sales/Last 30 Days", total: 0 };

      const totalProductsSold =
        totalProductSoldLast30Days.length > 0
          ? totalProductSoldLast30Days[0]
          : { _id: "Product Solds/Last 30 Days", total: 0 };
      const numberOfOrders =
        numberOfOrderLast30Days.length > 0
          ? numberOfOrderLast30Days[0]
          : { _id: "Number of Orders", total: 0 };
      return {
        message: "Dashboard State",
        success: true,
        data: [
          {
            ...totalSales,
            color: "primary",
            icon: "ion ion-bag",
          },
          {
            ...totalProductsSold,
            color: "success",
            icon: "fas fa-shopping-cart",
          },
          {
            ...customers,
            color: "warning",
            icon: "ion ion-person-add",
          },
          {
            ...numberOfOrders,
            color: "danger",
            icon: "ion ion-pie-graph",
          },
        ],
      };
    } catch (err: any) {
      return {
        message: "An error accourd while retrieving order stats",
        success: false,
      };
    }
  }

  public async getDashboardStates(req: Request): Promise<IReturnData<any>> {
    try {
      const { start, end } = req.query;

      const numberOfOrderLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
          },
        },
        {
          $group: {
            _id: "Number of Orders",
            total: {
              $sum: 1,
            },
          },
        },
      ]);

      const numberOfCustomerLast30Days = await UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
          },
        },
        {
          $group: {
            _id: "Number of Customers",
            total: {
              $sum: 1,
            },
          },
        },
      ]);

      const totalSalesInLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
            status: "delivered",
          },
        },
        {
          $group: {
            _id: "Sales/Last 30 Days",
            total: {
              $sum: "$grandTotal",
            },
          },
        },
      ]);

      //const totalNumberOfProducts: number = await ProductModel.count();
      const totalProductSoldLast30Days = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
            status: "delivered",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "Product Solds/Last 30 Days",
            total: {
              $sum: "$items.quantity",
            },
          },
        },
      ]);

      const customers =
        numberOfCustomerLast30Days.length > 0
          ? numberOfCustomerLast30Days[0]
          : { _id: "Number of Customers", total: 0 };
      const totalSales =
        totalSalesInLast30Days.length > 0
          ? totalSalesInLast30Days[0]
          : { _id: "Sales/Last 30 Days", total: 0 };

      const totalProductsSold =
        totalProductSoldLast30Days.length > 0
          ? totalProductSoldLast30Days[0]
          : { _id: "Product Solds/Last 30 Days", total: 0 };
      const numberOfOrders =
        numberOfOrderLast30Days.length > 0
          ? numberOfOrderLast30Days[0]
          : { _id: "Number of Orders", total: 0 };
      return {
        message: "Dashboard State",
        success: true,
        data: [
          {
            ...totalSales,
            color: "primary",
            icon: "ion ion-bag",
          },
          {
            ...totalProductsSold,
            color: "success",
            icon: "fas fa-shopping-cart",
          },
          {
            ...customers,
            color: "warning",
            icon: "ion ion-person-add",
          },
          {
            ...numberOfOrders,
            color: "danger",
            icon: "ion ion-pie-graph",
          },
        ],
      };
    } catch (err: any) {
      return {
        message: "An error accourd while retrieving order stats",
        success: false,
      };
    }
  }

  public async generateSaleReports(req: Request): Promise<IReturnData<any>> {
    try {
      let { year, adminid } = req.query;

      let match: any = {
        $match: {
          status: "delivered",
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,
        {
          $project: {
            createdAt: 1,
            status: 1,
            grandTotal: 1,
            adminId: 1,
            year: {
              $year: "$createdAt",
            },
          },
        },
        {
          $match: {
            year: parseInt("" + year),
          },
        },
        ...Quries.allMonthsTotalSalesByYear,
      ]);

      return {
        message: "All months sale of year " + year,
        success: true,
        data: result,
      };
    } catch (err: any) {
      console.log(err);
      return {
        message: "An error accourd while retrieving sales reports",
        success: false,
      };
    }
  }

  public async generateSaleReportsByYearAndMonth(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      let { year, adminid, month } = req.query;
      const currentMonth = new Date().getMonth() + 1;
      const from = moment(new Date(`${year}-${month}-01`))
        .startOf("month")
        .format("YYYY-MM-DD");
      const to =
        currentMonth === parseInt("" + month)
          ? moment().format("YYYY-MM-DD")
          : moment(new Date(`${year}-${month}-01`))
              .endOf("month")
              .format("YYYY-MM-DD");

      let match: any = {
        $match: {
          status: "delivered",
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,
        {
          $project: {
            createdAt: 1,
            status: 1,
            grandTotal: 1,
            adminId: 1,
            day: {
              $dayOfMonth: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
        },
        {
          $match: {
            year: parseInt("" + year),
            month: parseInt("" + month),
          },
        },
        ...Quries.AllDaysTotalSalesByYearAndMonth,
      ]);

      return {
        message: `All days sales of ${
          Quries.Months[parseInt("" + month)]
        } ${year}`,
        success: true,
        data: Utils.fillEmptyDates(result, { total: 0 }, from, to),
      };
    } catch (err: any) {
      console.log(err);
      return {
        message: "An error accourd while retrieving sales reports",
        success: false,
      };
    }
  }

  public async generateSalesReportInCategoryByMonthYear(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      let { year, adminid, month } = req.query;

      let match: any = {
        $match: {
          status: "delivered",
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,
        {
          $project: {
            createdAt: 1,
            grandTotal: 1,
            adminId: 1,
            items: 1,
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
        },
        {
          $match: {
            year: parseInt("" + year),
            month: parseInt("" + month),
          },
        },
        ...Quries.salesInCategory,
      ]);

      return {
        message: `Sales in category of ${
          Quries.Months[parseInt("" + month)]
        } ${year}`,
        success: true,
        data: result,
      };
    } catch (err: any) {
      console.log(err);
      return {
        message: "An error accourd while retrieving sales in category reports",
        success: false,
      };
    }
  }

  public async generateTopProductSalesCountByMonthYear(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      let { year, adminid, month } = req.query;

      let match: any = {
        $match: {
          status: "delivered",
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,
        {
          $project: {
            createdAt: 1,
            grandTotal: 1,
            adminId: 1,
            items: 1,
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
        },
        {
          $match: {
            year: parseInt("" + year),
            month: parseInt("" + month),
          },
        },
        ...Quries.productSalesCount,
      ]);

      return {
        message: `Top product sales count of ${
          Quries.Months[parseInt("" + month)]
        } ${year}`,
        success: true,
        data: result,
      };
    } catch (err: any) {
      console.log(err);
      return {
        message:
          "An error accourd while retrieving sales of top products reports",
        success: false,
      };
    }
  }

  public async generateDailyOrderSalesByStartAndEndDate(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      let { adminid, start, end } = req.query;

      let match: any = {
        $match: {
          status: "delivered",
          createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,

        ...Quries.dailyOrderSaleReports,
      ]);

      return {
        message: `Daily order sales reports from  ${moment(
          new Date("" + start)
        ).format("YYYY-MM-DD")} to ${end}`,
        success: true,
        data: Utils.fillEmptyDates(
          result,
          { total: 0, discount: 0, itemSales: 0, netTotal: 0 },
          moment(new Date("" + start)).format("YYYY-MM-DD"),
          moment(new Date("" + end)).format("YYYY-MM-DD")
        ),
      };
    } catch (err: any) {
      console.log(err);
      return {
        message:
          "An error accourd while retrieving sales of top products reports",
        success: false,
      };
    }
  }

  public async generateProductSalesByStartAndEndDate(
    req: Request
  ): Promise<IReturnData<any>> {
    try {
      let { adminid, start, end } = req.query;

      let match: any = {
        $match: {
          status: "delivered",
          createdAt: { $gte: new Date("" + start), $lt: new Date("" + end) },
        },
      };

      if (adminid !== undefined) {
        match.$match.adminId = Types.ObjectId("" + adminid);
      }

      const result = await OrderModel.aggregate([
        match,

        ...Quries.productSales,
      ]);

      return {
        message: `Products sales reports from  ${moment(
          new Date("" + start)
        ).format("YYYY-MM-DD")} to ${moment(new Date("" + end)).format(
          "YYYY-MM-DD"
        )}`,
        success: true,
        data: result,
      };
    } catch (err: any) {
      console.log(err);
      return {
        message:
          "An error accourd while retrieving sales of top products reports",
        success: false,
      };
    }
  }
}
