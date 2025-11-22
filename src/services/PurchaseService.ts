import { Request } from "express";
import { FilterQuery, Types } from "mongoose";
import { IReturnData } from "../base";
import {
  OrderItem,
  ProductModel,
  Purchase,
  PurchaseItem,
  PurchaseModel,
} from "../models";
import NotificationUtils from "../notifications/NotificationUtils";

const purchaseAggregateQuery = [
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "products",
    },
  },
  {
    $addFields: {
      items: {
        $map: {
          input: {
            $range: [0, { $size: "$items" }],
          },
          in: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$items", "$$this"],
              },
              {
                productDetail: {
                  title: {
                    $arrayElemAt: ["$products.title", "$$this"],
                  },
                  measurement: {
                    $arrayElemAt: ["$products.measurement", "$$this"],
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $project: {
      products: 0,
    },
  },
];

export default class PurchaseService {
  private getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  };

  async pagination(
    page: number,
    size: number,
    filter: FilterQuery<Purchase> = {}
  ): Promise<IReturnData<Purchase[]>> {
    try {
      const { limit, offset } = this.getPagination(page, size);
      const purchasesList = await (PurchaseModel as any).aggregatePaginate(
        PurchaseModel.aggregate([
          {
            $match: filter,
          },
          { $sort: { createdAt: -1 } },
          ...purchaseAggregateQuery,
        ]),
        {
          offset,
          limit,
        }
      );
      return {
        success: true,
        message: "Pruchases list",
        data: purchasesList,
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.message || "An error accord while getting purchase records",
      };
    }
  }

  async filterPurhcase(
    filter: FilterQuery<Purchase> = {}
  ): Promise<Purchase[]> {
    const purchases: Purchase[] = await PurchaseModel.aggregate([
      {
        $match: filter,
      },
      { $sort: { createdAt: -1 } },
      ...purchaseAggregateQuery,
    ]);
    return purchases;
  }

  async updatePurchaseItemById(req: Request): Promise<IReturnData<Purchase>> {
    try {
      let { quantityDiff } = req.body;
      const purchaseItem = this.setPurchaseItemId(req.body.purchaseItem);
      quantityDiff = quantityDiff ? parseInt(quantityDiff) : 0;
      const { adminid, id } = req.params;

      const purchase = await PurchaseModel.findById(id);

      if (purchase) {
        const newItems = purchase.items.map((item) =>
          "" + item.id === "" + purchaseItem.id ? purchaseItem : item
        );
        purchase.items = newItems;
        purchase.total = this.calculatePurchaseTotal(newItems);
        await purchase.save();
        const purchases = await this.filterPurhcase({
          _id: Types.ObjectId(id),
        });

        // //here update product quantities
        await this.updateSingleProductDetail(req, purchaseItem, quantityDiff);
        return {
          success: true,
          message: "Purchase item updated successfully",
          data: purchases[0],
        };
      } else {
        return {
          success: false,
          message: "No such id is available",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "An error accord while saving purchase record.",
      };
    }
  }

  async removePurhcaseItemById(req: Request): Promise<IReturnData<Purchase>> {
    try {
      let { adminid, purchaseid, itemid } = req.params;

      const purchase = await PurchaseModel.findById(purchaseid);

      if (purchase) {
        //this item will be removed
        const purchaseItem: PurchaseItem | undefined = purchase.items.find(
          (item) => "" + item.id === "" + itemid
        );
        const newItems = purchase.items.filter(
          (item) => "" + item.id !== "" + itemid
        );
        purchase.items = newItems;
        purchase.total =
          newItems.length === 0 ? 0 : this.calculatePurchaseTotal(newItems);

        console.log(JSON.stringify(purchase, null, 2));
        await purchase.save();
        const purchases = await this.filterPurhcase({
          _id: Types.ObjectId(purchaseid),
        });

        // //here update product quantities
        if (purchaseItem) {
          await this.updateSingleProductDetail(
            req,
            purchaseItem,
            -purchaseItem.quantity,
            false
          );
        }
        return {
          success: true,
          message: "Purchase item removed successfully",
          data: purchases[0],
        };
      } else {
        return {
          success: false,
          message: "No such id is available",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "An error accord while saving purchase record.",
      };
    }
  }

  async addNewPurchaesItem(req: Request): Promise<IReturnData<Purchase>> {
    try {
      let { adminid, purchaseid } = req.params;
      const purchaseItem: PurchaseItem = this.setPurchaseItemId(req.body);

      const purchase = await PurchaseModel.findById(purchaseid);

      if (purchase) {
        //this item will be removed

        const newItems = [...purchase.items, purchaseItem];
        purchase.items = newItems;
        purchase.total =
          newItems.length === 0 ? 0 : this.calculatePurchaseTotal(newItems);

        await purchase.save();
        const purchases = await this.filterPurhcase({
          _id: Types.ObjectId(purchaseid),
        });

        // //here update product quantities
        if (purchaseItem) {
          await this.updateSingleProductDetail(
            req,
            purchaseItem,
            purchaseItem.quantity
          );
        }
        return {
          success: true,
          message: "New purchase item added successfully",
          data: purchases[0],
        };
      } else {
        return {
          success: false,
          message: "No such id is available",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "An error accord while saving purchase record.",
      };
    }
  }

  async createPurchase(req: Request): Promise<IReturnData<Purchase[]>> {
    try {
      const items = this.setPurchaseItemIds(req.body.items);

      const total = this.calculatePurchaseTotal(items);
      const serialNo = await PurchaseModel.count();
      const newPurchase: any = {
        ...req.body,
        serialNo: serialNo + 1,
        items: items,
        total,
      };
      const purchase = await PurchaseModel.create(newPurchase);
      const purchases = await this.filterPurhcase({ _id: purchase._id });
      //here update product quantities
      const products = await this.updateProductQuantities(items, "inc");
      await NotificationUtils.sendProductQuantityUpdates(products, req);
      return {
        success: true,
        message: "New purcase list saved successfully.",
        data: purchases[0],
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "An error accord while saving purchase record.",
      };
    }
  }

  public async updateProductQuantities(
    items: PurchaseItem[],
    type: "dec" | "inc" = "dec"
  ) {
    const promises = items.map(function (item) {
      return ProductModel.updateOne(
        { _id: item.productId },
        {
          $inc: {
            "sku.quantity": type === "dec" ? -item.quantity : item.quantity,
          },
          "sku.price.vender": item.purchasePrice,
          "sku.price.base": item.retailPrice,
          "sku.price.sale": item.salePrice,
          "sku.price.discount": item.discount,
        }
      );
    });

    return await Promise.all(promises).then(async (result) => {
      const ids = items.map((item) => item.productId);
      const products = await ProductModel.find(
        { _id: { $in: ids } },
        {
          "sku.quantity": 1,
          "sku.price.base": 1,
          "sku.price.sale": 1,
          "sku.price.discount": 1,
        }
      );

      return products;
    });
  }

  public async updateSingleProductDetail(
    req: Request,
    item: PurchaseItem,
    quantity: number,
    updatePricesToo: boolean = true
  ) {
    const query = updatePricesToo
      ? {
          $inc: {
            "sku.quantity": quantity,
          },
          "sku.price.vender": item.purchasePrice,
          "sku.price.base": item.retailPrice,
          "sku.price.sale": item.salePrice,
          "sku.price.discount": item.discount,
        }
      : {
          $inc: {
            "sku.quantity": quantity,
          },
        };
    await ProductModel.updateOne({ _id: item.productId }, query);

    const products = await ProductModel.find(
      { _id: item.productId },
      {
        "sku.quantity": 1,
        "sku.price.base": 1,
        "sku.price.sale": 1,
        "sku.price.discount": 1,
      }
    );

    await NotificationUtils.sendProductQuantityUpdates(products, req);
  }

  private setPurchaseItemIds(purchaseItems: PurchaseItem[]) {
    return purchaseItems.map((item: PurchaseItem, index: number) => ({
      ...item,
      id: index + 1,
      productId: Types.ObjectId(item.productId as any),
    }));
  }

  private setPurchaseItemId(purchaseItems: PurchaseItem) {
    return {
      ...purchaseItems,
      productId: Types.ObjectId(purchaseItems.productId as any),
    };
  }

  private calculatePurchaseTotal(purchaseItems: PurchaseItem[]): number {
    const total: number = purchaseItems.reduce(
      (acc: any, obj: PurchaseItem) => {
        return acc + obj.purchasePrice * obj.quantity;
      },
      0
    );
    return total;
  }
}
