import { Request } from "express";
import { FilterQuery, Types } from "mongoose";
import { IReturnData } from "../base";
import { Favorite, FavoriteModel, Product, ProductModel } from "../models";
import { BaseService } from "./BaseService";
import ProductService from "./ProductService";
import Utils from "../Utils/Utils";

export default class FavoriteService extends BaseService<Favorite> {
  constructor() {
    super(FavoriteModel.modelName);
  }

  // async findAllWithDetailsAndFilter(
  //   filter: FilterQuery<Product> = {},
  //   page?: number,
  //   size?: number
  // ): Promise<IReturnData<Product[]>> {
  //   try {
  //     const service = new ProductService();
  //     const data = await service.findAllWithImageFilter(filter, page, size);
  //     return {
  //       message: "Favorite Products list.",
  //       success: true,
  //       data: data.data,
  //     };
  //   } catch (err) {
  //     return {
  //       message: "An error accord while retrieving product list ",
  //       success: false,
  //     };
  //   }
  // }

  async createFavorite(req: Request): Promise<IReturnData<Favorite>> {
    try {
      const prvFavorite = await FavoriteModel.findOne({
        userId: req.body.userId,
        productId: req.body.productId,
      });
      if (prvFavorite) {
        return {
          success: true,
          message: "Product added into your favorite list.",
          data: prvFavorite,
        };
      } else {
        const data: any = await FavoriteModel.create(req.body);
        return {
          message: "Product added into your favorite list.",
          success: true,
          data: data,
        };
      }
    } catch (err) {
      console.log(err);
      return { message: "An error occured", success: false };
    }
  }

  async removeFavorite(req: Request): Promise<IReturnData<Favorite>> {
    try {
      const { productId, userid } = req.params;

      const data = await FavoriteModel.findOne({
        productId: Types.ObjectId(productId),
        userId: Types.ObjectId(userid),
      });
      const deleteResult = await FavoriteModel.deleteOne({
        productId: Types.ObjectId(productId),
        userId: Types.ObjectId(userid),
      });
      if (deleteResult) {
        return {
          message: "Product removed from your favorite list.",
          success: true,
          data: data,
        };
      } else {
        return {
          message: "No favorite",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        message: `An err accord while removing product from favorite list.`,
        success: false,
      };
    }
  }
}
