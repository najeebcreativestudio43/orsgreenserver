import { IReturnData } from "../base";
import { Admin, AdminModel, Image } from "../models";
import { ISafeData } from "../server";
import Utils from "../Utils/Utils";
import { BaseService } from "./BaseService";
import jwt from "jsonwebtoken";
import config from "../config/config";
import Strings from "../Utils/Resources";
import FileUploadService from "./FileUploadService";
import { DocumentType } from "@typegoose/typegoose";
import { UpdateWriteOpResult } from "mongoose";
import { Role } from "../models/Admin.class";
import { Request } from "express";

export default class AdminService extends BaseService<Admin> {
  constructor() {
    super(AdminModel.modelName);
  }

  async register(admin: Admin): Promise<IReturnData<Admin>> {
    try {
      const isUsernameExist = await AdminModel.isUsernameExist(
        admin.username.toLowerCase()
      );
      if (!isUsernameExist) {
        const currentAdmin = await AdminModel.create(admin);
        if (currentAdmin) {
          return {
            message: "Created",
            success: true,
            data: currentAdmin,
          };
        } else {
          return {
            message: Strings.admin.registeringUserError,
            success: false,
          };
        }
      } else {
        FileUploadService.deleteFile(admin.store.avatar);
        return {
          message: Strings.admin.usernameExist,
          success: false,
          data: admin.username,
        };
      }
    } catch (err: any) {
      console.log(err);
      return { message: err.message, success: false };
    }
  }

  public async findAllManagers(): Promise<IReturnData<Admin[]>> {
    try {
      const managers: Admin[] = await AdminModel.find({ role: Role.MANAGER });

      return { message: "Managers list", success: true, data: managers };
    } catch (err) {
      console.log(err);
      return {
        message: "An error occured while getting managers list",
        success: false,
      };
    }
  }

  public async login(admin: Admin): Promise<IReturnData<ISafeData>> {
    try {
      const userFromDb: DocumentType<Admin> | null =
        await AdminModel.findByUsername(admin.username);

      if (userFromDb) {
        const isPasswordEqual = await Utils.comparePassword(
          admin.password!,
          userFromDb.password
        );
        if (isPasswordEqual) {
          return {
            message: Strings.admin.loggedInSuccessfully,
            success: true,
            data: this.prepareData(await userFromDb.setLastLogin(Date.now())),
          };
        } else {
          return { message: Strings.admin.invalidPassword, success: false };
        }
      } else {
        return { message: Strings.admin.invalidUsername, success: false };
      }
    } catch (err) {
      console.log(err);
      return { message: "An error occured", success: false };
    }
  }

  async changePasswordById(
    id: string,
    data: { password: string; currentPassword: string }
  ): Promise<IReturnData<UpdateWriteOpResult>> {
    try {
      if (Utils.isValidObjectId(id)) {
        const isOldPasswordMatch = await AdminModel.isOldPasswordMatch(
          data.currentPassword,
          id
        );

        if (isOldPasswordMatch) {
          var newUser = {
            password: await Utils.hashPassword(data.password),
          };
          const result: UpdateWriteOpResult = await AdminModel.updateOne(
            { _id: id },
            newUser
          );

          return {
            message: "Password changed successfully",
            success: true,
            data: result,
          };
        } else {
          return {
            message: "Wrong old password",
            success: false,
          };
        }
      } else {
        return {
          message: "No such user ",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while changing password. try again!",
        success: false,
      };
    }
  }

  async updateAvatarById(
    id: string,
    avatar: Image
  ): Promise<IReturnData<Admin>> {
    try {
      if (Utils.isValidObjectId(id)) {
        const admin: any = await AdminModel.removeUserPicture(id);
        admin.store.avatar = avatar;
        const result: UpdateWriteOpResult = await AdminModel.updateOne(
          { _id: id },
          admin
        );
        return {
          message: "Profile picture changed successfully",
          success: true,
          data: admin,
        };
      } else {
        return {
          message: "No such user ",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while changing profile picture",
        success: false,
      };
    }
  }

  async updateAdmin(id: string, admin: any): Promise<IReturnData<Admin>> {
    try {
      if (Utils.isValidObjectId(id)) {
        delete admin.password;

        const result: UpdateWriteOpResult = await AdminModel.updateOne(
          { _id: id },
          admin
        );
        return {
          message: "Admin updated successfull",
          success: true,
          data: await AdminModel.findOne({ _id: id }),
        };
      } else {
        return {
          message: "No such user ",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while updating user",
        success: false,
      };
    }
  }

  private prepareData(admin: Admin): any {
    const token = jwt.sign({ user: admin }, config.ACCESS_TOKEN_SECRET, {
      expiresIn: "30d",
    });
    const data = {
      admin,
      jwt: token,
    };

    return data;
  }
}
