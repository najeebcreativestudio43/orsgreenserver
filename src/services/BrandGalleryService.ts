import { Request } from "express";
import { IReturnData } from "../base";
import { BrandGallery, BrandGalleryModel } from "../models";
import { BaseService } from "./BaseService";

export default class BrandGalleryService extends BaseService<BrandGallery> {
  constructor() {
    super(BrandGalleryModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<BrandGallery>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newBrandGallery = await BrandGalleryModel.create(req.body);
      return {
        message: "Brand gallery image uploaded successfully",
        success: true,
        data: newBrandGallery,
      };
    } catch (err) {
      return {
        message: "An error accord while upload brand gallery image",
        success: false,
      };
    }
  }
}
