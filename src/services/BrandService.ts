import { FilterQuery, Types } from "mongoose";
import { IReturnData } from "../base";
import { Brand, BrandModel } from "../models";
import { BaseService } from "./BaseService";

const brandAggregateQuery = [
  {
    $lookup: {
      from: "brandgalleries",
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

export default class BrandService extends BaseService<Brand> {
  constructor(public readonly brand?: Brand) {
    super(BrandModel.modelName);
  }

  async findOneWithImageById(_id: string): Promise<Brand | undefined> {
    const brands: Brand[] = await BrandModel.aggregate([
      { $match: { _id: Types.ObjectId(_id) } },
      ...brandAggregateQuery,
    ]);
    if (brands.length > 0) {
      return brands[0];
    }
    return undefined;
  }

  async findAll(
    filter: FilterQuery<Brand> = {}
  ): Promise<IReturnData<Brand[]>> {
    try {
      const brands = await BrandModel.aggregate([
        {
          $match: filter,
        },
        ...brandAggregateQuery,
      ]);
      return {
        message: "Brands list",
        success: true,
        data: brands,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving brands list ",
        success: false,
      };
    }
  }

  private getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  };
  async findAllByPaging(
    filter: FilterQuery<Brand> = {},
    page?: number,
    size?: number,
    options: any[] = []
  ): Promise<IReturnData<Brand[]>> {
    try {
      if (page !== undefined && size !== undefined) {
        const { limit, offset } = this.getPagination(page, size);
        const brands = await (BrandModel as any).aggregatePaginate(
          BrandModel.aggregate([
            {
              $match: filter,
            },
            ...brandAggregateQuery,
          ]),
          {
            offset,
            limit,
          }
        );
        return {
          message: "Brands list",
          success: true,
          data: brands,
        };
      } else {
        //todo without pagination list
        const brands = await BrandModel.aggregate([
          {
            $match: filter,
          },
          ...options,
          ...brandAggregateQuery,
        ]);
        return {
          message: "Brands list",
          success: true,
          data: brands,
        };
      }
    } catch (err: any) {
      return {
        message: "An error accord while retrieving brands list ",
        success: false,
      };
    }
  }
}
