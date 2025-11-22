import { FilterQuery } from "mongoose";
import { IReturnData } from "../base";
import {
  SubCategory,
  SubCategoryModel,
  Product,
  ProductModel,
} from "../models";
import { BaseService } from "./BaseService";

export default class SubCategoryService extends BaseService<SubCategory> {
  constructor(public readonly category?: SubCategory) {
    super(SubCategoryModel.modelName);
  }

  async findOneWithImageById(_id: string): Promise<SubCategory | null> {
    return await SubCategoryModel.findOne({ _id })
      .populate("image")
      .populate("category")
      .exec();
  }

  async findAll(
    filter: FilterQuery<SubCategory> = {}
  ): Promise<IReturnData<SubCategory[]>> {
    try {
      const category = await SubCategoryModel.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "subcategorygalleries",
            localField: "imageId",
            foreignField: "_id",
            as: "images",
          },
        },
        {
          $project: {
            isActive: 1,
            title: 1,
            imageId: 1,
            categoryId: 1,
            adminId: 1,

            createdAt: 1,
            updatedAt: 1,
            image: {
              $cond: {
                if: { $gt: [{ $size: "$images" }, 0] },
                then: { $arrayElemAt: ["$images.image", 0] },
                else: undefined,
              },
            },
            // image: {
            //   $first: "$images.image",
            // },
          },
        },
      ]);
      return {
        message: "Sub Categories list",
        success: true,
        data: category,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving subcategory list ",
        success: false,
      };
    }
  }
}
