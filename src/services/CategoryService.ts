import { Types } from "mongoose";
import { IReturnData } from "../base";
import { Category, CategoryModel } from "../models";
import { BaseService } from "./BaseService";

const categoryAggregateQuery = [
  {
    $lookup: {
      from: "categorygalleries",
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
      content: 1,
      createdAt: 1,
      updatedAt: 1,
      adminId: 1,
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
];

export default class CategoryService extends BaseService<Category> {
  constructor(public readonly category?: Category) {
    super(CategoryModel.modelName);
  }

  async findOneWithImageById(_id: string): Promise<Category | undefined> {
    const categories: Category[] = await CategoryModel.aggregate([
      { $match: { _id: Types.ObjectId(_id) } },
      ...categoryAggregateQuery,
    ]);
    if (categories.length > 0) {
      return categories[0];
    }
    return undefined;
  }

  async findAll(adminid: string): Promise<IReturnData<Category[]>> {
    try {
      const category = await CategoryModel.aggregate([
        {
          $match: { adminId: Types.ObjectId(adminid) },
        },
        ...categoryAggregateQuery,
      ]);
      return {
        message: "Categories list",
        success: true,
        data: category,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving category list ",
        success: false,
      };
    }
  }
}
