import { FilterQuery } from "mongoose";
import { IReturnData } from "../base";
import { ProductCategory, ProductCategoryModel } from "../models";
import { BaseService } from "./BaseService";

export default class ProductCategoryService extends BaseService<ProductCategory> {
  constructor() {
    super(ProductCategoryModel.modelName);
  }

  async findOneWithCategoryAndSubCategory(
    _id: string
  ): Promise<ProductCategory | null> {
    return await ProductCategoryModel.findOne({ _id })
      .populate("category")
      .populate("subCategory")
      .exec();
  }

  async findAll(
    filter: FilterQuery<ProductCategory> = {}
  ): Promise<IReturnData<ProductCategory[]>> {
    try {
      const category = await ProductCategoryModel.find(filter)
        .populate("category")
        .populate("subCategory")
        .exec();
      return {
        message: "Product Categories list",
        success: true,
        data: category,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving product category list ",
        success: false,
      };
    }
  }

  async findAllActiveByFilter(
    filter: FilterQuery<ProductCategory> = {}
  ): Promise<IReturnData<ProductCategory[]>> {
    try {
      const category = await ProductCategoryModel.find(filter);

      return {
        message: "Product Categories list",
        success: true,
        data: category,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving product category list ",
        success: false,
      };
    }
  }
}
