import { UpdateWriteOpResult } from "mongoose";
import { IReturnData, IWrite } from "../base";
import config from "../config/config";
import { Image, User, UserModel } from "../models";
import { ISafeData } from "../server";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DocumentType } from "@typegoose/typegoose";
import Strings from "../Utils/Resources";
import Utils from "../Utils/Utils";
import { BaseService } from "./BaseService";
import EmailService from "./EmailService";
import { Request } from "express-serve-static-core";
import FileUploadService from "./FileUploadService";
import { LifetimeSmsApiService } from ".";

export default class UserService extends BaseService<User> {
  constructor() {
    super(UserModel.modelName);
  }

  public async findOneByUserIdWithDefaultAddress(_id: string): Promise<any> {
    const user = await UserModel.findOne({ _id }).populate({
      path: "defaultAddress",
      match: { isDefault: true },
    });
    return user;
  }

  public async findAllWithDefaultAddress(): Promise<IReturnData<User>> {
    try {
      const users = await UserModel.find().populate({
        path: "defaultAddress",
        match: { isDefault: true },
      });

      return {
        message: "Users list with default address",
        success: true,
        data: users,
      };
    } catch (err) {
      return {
        message:
          "An error , accord while retrieving user list with default addresses",
        success: false,
      };
    }
  }

  public async registerOrLogin(body: any): Promise<IReturnData<User>> {
    try {
      const user = await UserModel.findByMobile(body.mobile);
      if (user) {
        //generate and send otp
        const otp = Utils.generateOTP();
        // save otp to user collection
        user.phoneOtp = otp;

        await user.save();
        await LifetimeSmsApiService.sendOTP(user.mobile, otp);
        return {
          message: "OTP sended to your registered phone number",
          success: true,
          data: user,
        };
      } else {
        //user not registerd
        const createUser = await UserModel.create(body);
        const otp = Utils.generateOTP();
        // save otp to user collection
        createUser.phoneOtp = otp;
        await createUser.save();
        await LifetimeSmsApiService.sendOTP(createUser.mobile, otp);
        return {
          message: "Account created OTP sended to mobile number",
          success: true,
          data: createUser,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "Can't login user. try again",
        success: false,
      };
    }
  }

  public async verifyPhoneOtp(body: any): Promise<IReturnData<ISafeData>> {
    try {
      const { otp, userId, deviceToken } = body;
      console.log("opt body", body);
      const user = await UserModel.findOne({ _id: userId });
      if (!user) {
        return {
          message: "User not found",
          success: false,
        };
      }
      if (user.phoneOtp !== otp) {
        return {
          message: "Invalid OTP",
          success: false,
        };
      }

      user.phoneOtp = "";
      user.lastLogin = Date.now();
      user.deviceToken = deviceToken;
      await user.save();

      return {
        message: "OTP verified successfully",
        success: true,
        data: this.prepareData(user),
      };
    } catch (err) {
      return {
        message: "An error , accord while verifying phone otp try again",
        success: false,
      };
    }
  }

  public async updateUserImage(req: Request): Promise<IReturnData<User>> {
    try {
      const { id } = req.params;
      if (req.file) {
        const currentUser = await UserModel.findOne({ _id: id });
        FileUploadService.deleteFile(currentUser?.avatar);
        await UserModel.updateOne({ _id: id }, { avatar: req.file });
        const user = await UserModel.findOne({ _id: id });
        return {
          message: "User profile updated successfully",
          success: true,
          data: user,
        };
      } else {
        return {
          message: "An error accord while uploading user profile image",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while updating user profile",
        success: false,
      };
    }
  }

  public async updateUser(req: Request): Promise<IReturnData<User>> {
    try {
      const { id } = req.params;
      let imageTobeDelete = undefined;
      console.log(req.file);
      if (req.file) {
        if (req.body.avatar) {
          imageTobeDelete = JSON.parse(req.body.avatar);
          FileUploadService.deleteFile(imageTobeDelete);
        }
        req.body.avatar = req.file;
      } else {
        if (req.body.avatar) {
          req.body.avatar = JSON.parse(req.body.avatar);
        }
      }

      await UserModel.updateOne({ _id: id }, req.body);
      const user = await UserModel.findOne({ _id: id });
      return {
        message: "User profile updated successfully",
        success: true,
        data: user,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while updating user profile",
        success: false,
      };
    }
  }

  private prepareData(user: User): ISafeData {
    const token = jwt.sign({ user }, config.ACCESS_TOKEN_SECRET, {
      expiresIn: "30d",
    });
    const data: ISafeData = {
      user,
      jwt: token,
    };

    return data;
  }
}
