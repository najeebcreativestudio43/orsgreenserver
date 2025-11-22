import { Request } from "express";
import { IReturnData } from "../base";
import { SubCategoryGallery, SubCategoryGalleryModel } from "../models";
import { BaseService } from "./BaseService";

export default class SubCategoryGalleryService extends BaseService<SubCategoryGallery> {
  constructor() {
    super(SubCategoryGalleryModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<SubCategoryGallery>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newSubCategoryGallery = await SubCategoryGalleryModel.create(
        req.body
      );
      return {
        message: "SubCategory gallery image uploaded successfully",
        success: true,
        data: newSubCategoryGallery,
      };
    } catch (err) {
      return {
        message: "An error accord while upload subcategory gallery image",
        success: false,
      };
    }
  }
}
