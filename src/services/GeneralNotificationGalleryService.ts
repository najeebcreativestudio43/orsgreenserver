import { Request } from "express";
import { IReturnData } from "../base";
import {
  GeneralNotificationGallery,
  GeneralNotificationGalleryModel,
} from "../models";
import { BaseService } from "./BaseService";

export default class GeneralNotificaitionGalleryService extends BaseService<GeneralNotificationGallery> {
  constructor() {
    super(GeneralNotificationGalleryModel.modelName);
  }
  async save(req: Request): Promise<IReturnData<GeneralNotificationGallery>> {
    try {
      if (req.file) {
        req.body.image = req.file;
      }
      const newGallery = await GeneralNotificationGalleryModel.create(req.body);
      return {
        message: "Noitification gallery image uploaded successfully",
        success: true,
        data: newGallery,
      };
    } catch (err) {
      return {
        message: "An error accord while upload notification gallery image",
        success: false,
      };
    }
  }
}
