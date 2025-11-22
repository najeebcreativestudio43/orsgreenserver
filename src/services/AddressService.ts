import { Request } from "express";
import { UpdateWriteOpResult } from "mongoose";
import { IReturnData, IWrite } from "../base";
import logging from "../config/logging";
import { Address, AddressModel } from "../models";
import Utils from "../Utils/Utils";
import { BaseService } from "./BaseService";

export default class AddressService extends BaseService<Address> {
  constructor() {
    super(AddressModel.modelName);
  }

  async save(req: Request): Promise<IReturnData<Address>> {
    try {
      const address = await AddressModel.create(req.body);

      return {
        message: "User address saved successfully",
        success: true,
        data: address,
      };
    } catch (err) {
      return {
        message: "An error accord while saving user address",
        success: false,
      };
    }
  }

  async updateOneById(req: Request): Promise<IReturnData<Address>> {
    try {
      const {
        body,
        params: { userid, id },
      } = req;
      if (body.isDefault) {
        //findPrevious default address of the user
        const prevDefaultAddress = await AddressModel.findOne({
          userId: userid,
          isDefault: true,
        });

        if (prevDefaultAddress) {
          prevDefaultAddress.isDefault = false;
          prevDefaultAddress.save();
        }
      }
      const updateResult = await AddressModel.updateOne({ _id: id }, body);
      const address = await AddressModel.findOne({ _id: id });
      return {
        message: "User address saved successfully",
        success: true,
        data: address,
      };
    } catch (err: any) {
      return {
        message: "An error accord while saving user address",
        success: false,
      };
    }
  }

  async findOneDefault(userId: string): Promise<IReturnData<Address>> {
    try {
      if (Utils.isValidObjectId(userId)) {
        const item = await this.findOne({ userId, isDefault: true });
        if (item.data) {
          return item;
        } else {
          return {
            message: "No default address",
            success: true,
          };
        }
      } else {
        return {
          message: "No such user",
          success: false,
        };
      }
    } catch (err: any) {
      logging.error("GET DEFAULT ADDRESS", err.message);
      return {
        message: "An error accord while finding default address",
        success: false,
      };
    }
  }
}
