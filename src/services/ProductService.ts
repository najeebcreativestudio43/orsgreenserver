import {
  FilterQuery,
  PaginateModel,
  Types,
  UpdateWriteOpResult,
} from "mongoose";
import { Multer } from "multer";
import { IReturnData } from "../base";
import {
  Category,
  IDistinctColor,
  IDistinctTag,
  Product,
  ProductModel,
} from "../models";
import { BaseService } from "./BaseService";
import FileUploadService from "./FileUploadService";

const productAggregateQuery = [
  {
    $lookup: {
      from: "productgalleries",
      localField: "imageId",
      foreignField: "_id",
      as: "images",
    },
  },
  {
    $project: {
      saleType: 1,
      isActive: 1,
      tags: 1,
      title: 1,
      imageId: 1,
      categoryId: 1,
      subCategoryId: 1,
      productCategoryId: 1,
      adminId: 1,
      brandId: 1,
      sku: 1,
      measurement: 1,
      createdAt: 1,
      updatedAt: 1,
      summary: 1,
      content: 1,
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

export default class ProductService extends BaseService<Product> {
  constructor(public readonly product?: Product) {
    super(ProductModel.modelName);
  }

  async findOneWithFullInfoById(_id: string): Promise<Product | undefined> {
    const products: Product[] = await ProductModel.aggregate([
      { $match: { _id: Types.ObjectId(_id) } },
      ...productAggregateQuery,
    ]);
    if (products.length > 0) {
      return products[0];
    }
    return undefined;
  }

  async findAllWithImageFilter(
    filter: FilterQuery<Product> = {},
    page?: number,
    size?: number
  ): Promise<IReturnData<Product[]>> {
    try {
      if (page !== undefined && size !== undefined) {
        const { limit, offset } = this.getPagination(page, size);

        const products = await (ProductModel as any).aggregatePaginate(
          ProductModel.aggregate([
            {
              $match: filter,
            },
            {
              $lookup: {
                from: "productgalleries",
                localField: "imageId",
                foreignField: "_id",
                as: "images",
              },
            },
            {
              $project: {
                saleType: 1,
                isActive: 1,
                tags: 1,
                title: 1,
                imageId: 1,
                categoryId: 1,
                subCategoryId: 1,
                productCategoryId: 1,
                adminId: 1,
                brandId: 1,
                sku: 1,
                measurement: 1,
                createdAt: 1,
                updatedAt: 1,
                content: 1,
                summary: 1,
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
          ]),
          {
            offset,
            limit,
          }
        );
        return {
          message: "Product list",
          success: true,
          data: products,
        };
      } else {
        const products = await ProductModel.aggregate([
          {
            $match: filter,
          },
          ...productAggregateQuery,
        ]);

        return {
          message: "Product list without paging",
          success: true,
          data: products,
        };
      }
    } catch (err: any) {
      return {
        message:
          err.message || "An error accord while retrieving product list ",
        success: false,
      };
    }
  }

  async findProductsWithDetails(
    filter: FilterQuery<Product> = {},
    options: any[] = []
  ): Promise<IReturnData<Product[]>> {
    try {
      const products = await ProductModel.aggregate([
        {
          $match: filter,
        },
        ...options,
        ...productAggregateQuery,
      ]);

      return {
        message: "Product list without paging",
        success: true,
        data: products,
      };
    } catch (err) {
      return {
        message: "An error accord while retrieving product list ",
        success: false,
      };
    }
  }

  private readonly myCustomLabels = {
    docs: "data",
  };

  private getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  };

  async pagination(
    page: number,
    size: number,
    filterCategories: string[],
    filterColors: string[],
    minPrice: number,
    maxPrice: number,
    filterTags: string[],
    searchText?: string
  ): Promise<IReturnData<any>> {
    try {
      let query = {
        $and: [{ isActive: true }],
      };
      if (filterCategories.length > 0) {
        (query.$and as any).push({
          categoryIds: { $in: filterCategories },
        });
      }

      if (filterColors.length > 0) {
        (query.$and as any).push({ "colors.name": { $in: filterColors } });
      }

      if (searchText) {
        (query.$and as any).push({
          title: { $regex: searchText, $options: "i" },
        });
      }
      if (minPrice > 0 && maxPrice > 0 && maxPrice > minPrice) {
        (query.$and as any).push({ "sku.price.sale": { $gte: minPrice } });
        (query.$and as any).push({ "sku.price.sale": { $lte: maxPrice } });
      }

      if (filterTags.length > 0) {
        (query.$and as any).push({ tags: { $in: filterTags } });
      }

      const { limit, offset } = this.getPagination(page - 1, size);
      const items: any = await (ProductModel as any).paginate(query, {
        offset,
        limit,
        populate: "categories",

        customLabels: this.myCustomLabels,
      });
      return {
        message: "Items",
        success: true,
        data: items,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting records",
        success: false,
      };
    }
  }

  async findAllDistinctsColorsWithOccurence(): Promise<
    IReturnData<IDistinctColor[]>
  > {
    try {
      const colors = await ProductModel.aggregate([
        { $unwind: "$sku" },
        { $unwind: "$sku.options.colors" },
        {
          $group: {
            _id: "$sku.options.colors.name",
            count: { $sum: Number(1) },
          },
        },
      ]);

      return {
        message: "all distinct colors tags with count",
        success: true,
        data: colors,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting color tags",
        success: false,
      };
    }
  }

  async findAllDistinctsTags(): Promise<IReturnData<IDistinctTag[]>> {
    try {
      const tags = await ProductModel.aggregate([
        { $unwind: "$tags" },
        {
          $group: {
            _id: "$tags",
          },
        },
      ]);

      return {
        message: "all distinct tags tags with count",
        success: true,
        data: tags,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting tags",
        success: false,
      };
    }
  }
}
