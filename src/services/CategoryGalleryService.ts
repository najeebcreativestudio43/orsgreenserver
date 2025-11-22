import { Request } from "express";
import { IReturnData } from "../base";
import { CategoryGallery, CategoryGalleryModel } from "../models";
import { BaseService } from "./BaseService";

export default class CategoryGalleryService extends BaseService<CategoryGallery> {
  constructor() {
    super(CategoryGalleryModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<CategoryGallery>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newCategoryGallery = await CategoryGalleryModel.create(req.body);
      return {
        message: "Category gallery image uploaded successfully",
        success: true,
        data: newCategoryGallery,
      };
    } catch (err) {
      return {
        message: "An error accord while upload category gallery image",
        success: false,
      };
    }
  }
}
