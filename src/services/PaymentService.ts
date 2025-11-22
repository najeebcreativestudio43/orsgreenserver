import { UpdateWriteOpResult } from "mongoose";
import { IReturnData, IWrite } from "../base";
import logging from "../config/logging";
import { Payment, PaymentModel } from "../models";
import Utils from "../Utils/Utils";
import { BaseService } from "./BaseService";

export default class PaymentService extends BaseService<Payment> {
  constructor(public readonly Payment?: Payment) {
    super(PaymentModel.modelName);
  }

  async findOneDefault(userId: string): Promise<IReturnData<Payment>> {
    try {
      if (Utils.isValidObjectId(userId)) {
        const item = await this.findOne({ userId, isDefault: true });
        if (item.data) {
          return item;
        } else {
          return {
            message: "No default payment mothod",
            success: true,
          };
        }
      } else {
        return {
          message: "No such user",
          success: false,
        };
      }
    } catch (err) {
      return {
        message: "An error accord while finding default payment method",
        success: false,
      };
    }
  }
}
