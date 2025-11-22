import { Request } from "express";
import { IReturnData } from "../base";
import { Banner, BannerModel } from "../models";
import { BaseService } from "./BaseService";

export default class BannerService extends BaseService<Banner> {
  constructor() {
    super(BannerModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<Banner>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newBanner = await BannerModel.create(req.body);
      return {
        message: "Banner uploaded successfully",
        success: true,
        data: newBanner,
      };
    } catch (err) {
      return {
        message: "An error accord while uploading banner image",
        success: false,
      };
    }
  }
}
