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
      console.log("found user", user);
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

  public async registerWithEmail(body: any): Promise<IReturnData<User>> {
    try {
      const { email, password, name, phone } = body;

      // Validate required fields
      if (!email || !password || !name || !phone) {
        return {
          message: "Email, password, name, and phone are required",
          success: false,
        };
      }

      // Check email exists
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail) {
        return {
          message: "Email already registered",
          success: false,
        };
      }

      // Check phone exists
      const existingPhone = await UserModel.findOne({ mobile: phone });
      if (existingPhone) {
        return {
          message: "Phone number already registered",
          success: false,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await UserModel.create({
        ...body,
        password: hashedPassword,
        firstName: name,
        lastName: name,
        mobile: phone,
      });

      return {
        message: "Account created successfully",
        success: true,
        data: newUser,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "Unable to register user",
        success: false,
      };
    }
  }

  /////////////
  // *****?
  public async loginWithEmail(body: any): Promise<IReturnData<ISafeData>> {
    try {
      const { email, password } = body;

      const user: any = await UserModel.findOne({ email });
      if (!user) {
        return {
          message: "Email not found",
          success: false,
        };
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          message: "Invalid password",
          success: false,
        };
      }

      user.lastLogin = Date.now();
      await user.save();

      return {
        message: "Login successful",
        success: true,
        data: this.prepareData(user),
      };
    } catch (err) {
      console.log(err, "errvas");
      return {
        message: "Unable to login",
        success: false,
      };
    }
  }

  /////////////
  // *****?
  public async forgotPassword(body: any): Promise<IReturnData<User>> {
    try {
      const { email } = body;

      const user: any = await UserModel.findOne({ email });
      if (!user) {
        return {
          message: "User not found",
          success: false,
        };
      }

      const otp = Utils.generateOTP();
      user.phoneOtp = otp;
      await user.save();

      const responsemail = await EmailService.sendEmail(email, otp);
      return {
        message: "OTP sent to email",
        success: true,
      };
    } catch (err) {
      return {
        message: "Unable to send OTP",
        success: false,
      };
    }
  }

  /////////////
  // *****?
  public async resetPassword(body: any): Promise<IReturnData<User>> {
    try {
      const { email, otp, newPassword } = body;

      const user: any = await UserModel.findOne({ email });
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

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.phoneOtp = "";
      await user.save();

      return {
        message: "Password reset successful",
        success: true,
        data: user,
      };
    } catch (err) {
      return {
        message: "Unable to reset password",
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
