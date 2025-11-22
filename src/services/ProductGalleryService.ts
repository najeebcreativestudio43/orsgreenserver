import { Request } from "express";
import { IReturnData } from "../base";
import { ProductGallery, ProductGalleryModel } from "../models";
import { BaseService } from "./BaseService";

export default class ProductGalleryService extends BaseService<ProductGallery> {
  constructor() {
    super(ProductGalleryModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<ProductGallery>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newProductGallery = await ProductGalleryModel.create(req.body);
      return {
        message: "Product gallery image uploaded successfully",
        success: true,
        data: newProductGallery,
      };
    } catch (err) {
      return {
        message: "An error accord while upload product gallery image",
        success: false,
      };
    }
  }
}
