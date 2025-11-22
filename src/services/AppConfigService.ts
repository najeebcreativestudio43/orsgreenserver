import { Request } from "express";
import { IReturnData } from "../base";
import { AppConfig, AppConfigModel } from "../models";

export default class AppConfigService {
  public async createOrUpdateAppConfig(
    req: Request
  ): Promise<IReturnData<AppConfig>> {
    try {
      if (req.body._id !== undefined) {
        const result = await AppConfigModel.updateOne(
          { _id: req.body._id },
          req.body
        );
        return {
          message: "App Config saved successfully.",
          success: true,
          data: req.body,
        };
      } else {
        const charge = await AppConfigModel.create(req.body);
        return {
          message: "App Config saved successfully.",
          success: true,
          data: charge,
        };
      }
    } catch (err: any) {
      return {
        message: "Error accord while saving app configuration",
        success: false,
      };
    }
  }

  public async getAppConfig(): Promise<IReturnData<AppConfig>> {
    try {
      const count = await AppConfigModel.count();
      if (count === 0) {
        await AppConfigModel.create({
          deliveryCharge: {
            minAmount: 0,
            chargeAmount: 0,
            chargePerKm: 0,
          },
        });
      }
      const appConfig = await AppConfigModel.find();

      return {
        message: "Delivery Charges",
        success: true,
        data: appConfig[0],
      };
    } catch (err: any) {
      return {
        message: "Error accord while getting app configuration",
        success: false,
      };
    }
  }
}
