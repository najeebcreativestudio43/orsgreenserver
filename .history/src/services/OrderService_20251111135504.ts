import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import { FilterQuery, Types, UpdateWriteOpResult } from "mongoose";
import AppConfigService from "./AppConfigService";
import { IReturnData, IWrite } from "../base";
import {
  Admin,
  AdminModel,
  AppConfigModel,
  Order,
  OrderItem,
  OrderModel,
  Product,
  ProductModel,
} from "../models";
import { Role } from "../models/Admin.class";
import NotificationUtils from "../notifications/NotificationUtils";

const orderQuery = [
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "products",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "users",
    },
  },
  {
    $lookup: {
      from: "admins",
      localField: "adminId",
      foreignField: "_id",
      as: "admins",
    },
  },

  {
    $lookup: {
      from: "productgalleries",
      localField: "products.imageId",
      foreignField: "_id",
      as: "images",
    },
  },
  {
    $addFields: {
      items: {
        $map: {
          input: {
            $range: [
              0,
              {
                $size: "$items",
              },
            ],
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
                  sku: {
                    $arrayElemAt: ["$products.sku", "$$this"],
                  },
                  image: {
                    $arrayElemAt: ["$images.image", "$$this"],
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
      user: { $first: "$users" },
      admin: { $first: "$admins" },
      status: 1,
      declinedReason: 1,
      invoiceNo: 1,
      tax: 1,
      shipping: 1,
      flatDisocunt: 1,
      items: 1,
      subTotal: 1,
      grandTotal: 1,
      shippingInfo: 1,
      orderNote: 1,
      userId: 1,
      adminId: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
];

export default class OrderService {
  constructor() {}

  private getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  };

  async pagination(
    page: number,
    size: number,
    match: any
  ): Promise<IReturnData<Order[]>> {
    try {
      const { limit, offset } = this.getPagination(page, size);

      const items: any = await (OrderModel as any).aggregatePaginate(
        OrderModel.aggregate([
          {
            $match: match,
          },
          { $sort: { createdAt: -1 } },
          ...orderQuery,
        ]),
        {
          offset,
          limit,
        }
      );
      return {
        message: "Orders by page " + (page + 1),
        success: true,
        data: items,
      };
    } catch (err: any) {
      console.log(err.message);
      return {
        message: "An error, accord while retrieving manager orders by page",
        success: false,
      };
    }
  }

  async findAllOrdersByFilter(match: any): Promise<IReturnData<Order[]>> {
    try {
      const items: any = await OrderModel.aggregate([
        {
          $match: match,
        },
        { $sort: { createdAt: -1 } },
        ...orderQuery,
      ]);
      return {
        message: "Orders List",
        success: true,
        data: items,
      };
    } catch (err: any) {
      return {
        message: "An error, accord while retrieving manager orders list",
        success: false,
      };
    }
  }

  public async findOrderWithProductAndUserDetail(
    filter: FilterQuery<Order> = {}
  ): Promise<Order[]> {
    return await OrderModel.aggregate([
      {
        $match: filter,
      },
      ...orderQuery,
    ]);
  }

  public async updateOrderStatusById(
    req: Request,
    filter: FilterQuery<Order> = {}
  ): Promise<IReturnData<Order>> {
    try {
      const { orderid } = req.params;

      await OrderModel.updateOne(
        { _id: parseInt("" + orderid) },
        { ...req.body }
      );
      const orders = await this.findOrderWithProductAndUserDetail(filter);

      console.log("orders length", orders.length);

      return {
        message: "Order status changed successfully",
        success: true,
        data: orders[0],
      };
    } catch (err: any) {
      return {
        message: "An error,accord while changing order status",
        success: false,
      };
    }
  }

  public async findNearestStore(location: {
    type: string;
    coordinates: [number, number];
  }): Promise<DocumentType<Admin> | null> {
    return await AdminModel.findOne({
      role: Role.MANAGER,
      "store.address.location": {
        $near: {
          $geometry: location,
          $maxDistance: 3 * 1000,
          $minDistance: 0,
        },
      },
    });
  }

  private async convertItemsIdToObjectIdsAndCalculateTotals(
    order: Order
  ): Promise<Order> {
    let subTotal = 0.0;
    const deliveryCharges = await this.getDeliveryCharges();
    const items = order.items.map((item: any, index: number) => {
      subTotal = subTotal + item.quantity * item.price.sale;
      console.log(subTotal);
      return {
        ...item,
        id: index + 1,
        productId: Types.ObjectId(item.productId),
        categoryId: Types.ObjectId(item.categoryId),
        subCategoryId: Types.ObjectId(item.subCategoryId),
        productCategoryId: Types.ObjectId(item.productCategoryId),
        brandId: Types.ObjectId(item.brandId),
      };
    });
    const shippingCost =
      subTotal >= deliveryCharges.minAmount ? 0 : deliveryCharges.chargeAmount;
    return {
      ...order,
      items: items,
      subTotal: subTotal,
      shipping: shippingCost,
      grandTotal: shippingCost + subTotal,
    };
  }

  public convertOrderItemToObjectId(item: any): any {
    return {
      ...item,
      productId: Types.ObjectId(item.productId),
      categoryId: Types.ObjectId(item.categoryId),
      subCategoryId: Types.ObjectId(item.subCategoryId),
      productCategoryId: Types.ObjectId(item.productCategoryId),
      brandId: Types.ObjectId(item.brandId),
    };
  }

  public async findAllPopularProductIds(stages: any[]): Promise<string[]> {
    try {
      const data = await OrderModel.aggregate([
        // {
        //   $match: {
        //     status: "delivered",
        //   },
        // },
        {
          $unwind: "$items",
        },
        // Second Stage
        {
          $group: {
            _id: "$items.productId",
            count: {
              $sum: 1,
            },
          },
        },
        ...stages,
      ]);

      return data.map((d) => d._id);
    } catch (err: any) {
      return [];
    }
  }

  public async createOrder(req: Request): Promise<IReturnData<Order>> {
    try {
      const nearestStore = await this.findNearestStore(
        req.body.shippingInfo.location
      );

      if (nearestStore) {
        req.body.adminId = nearestStore._id;
        req.body = this.convertItemsIdToObjectIdsAndCalculateTotals(req.body);
        const order = await OrderModel.create(req.body);
        order.invoiceNo = "HNT-" + order._id;
        await order.save();
        const orderWithDetail = await this.findOrderWithProductAndUserDetail({
          _id: order._id,
        });
        const updatedProducts = await this.updateProductQuantities(order.items);
        await NotificationUtils.sendProductQuantityUpdates(
          updatedProducts,
          req
        );

        return {
          message: "Order placed successfully.",
          success: true,
          data: orderWithDetail[0],
        };
      }
      return {
        message: "No store found",
        success: false,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while placing new order d",
        success: false,
      };
    }
  }

  public async updateProductQuantities(
    items: OrderItem[],
    type: "dec" | "inc" = "dec"
  ) {
    const promises = items.map(function (item) {
      return ProductModel.updateOne(
        { _id: item.productId },
        {
          $inc: {
            "sku.quantity": type === "dec" ? -item.quantity : item.quantity,
          },
        }
      );
    });

    return await Promise.all(promises).then(async (result) => {
      const ids = items.map((item) => item.productId);
      const products = await ProductModel.find(
        { _id: { $in: ids } },
        { "sku.quantity": 1 }
      );

      return products;
    });
  }

  public async addOrderItem(req: Request): Promise<IReturnData<Order>> {
    try {
      const { orderid } = req.params;
      const orderItem = req.body;
      const order = await OrderModel.findOne({ _id: parseInt(orderid) });

      if (order) {
        const orderItemExist =
          order.items.find((item) => item.productId === orderItem.productId) !==
          undefined;
        let items = [];
        if (orderItemExist) {
          console.log("orderItemexists", orderItemExist);
          items = order.items.map((item) =>
            item.productId === orderItem.productId
              ? {
                  ...item,
                  quantity: item.quantity + orderItem.quantity,
                  price: {
                    ...orderItem,
                  },
                  size: orderItem.size,
                  color: orderItem.color,
                }
              : item
          );
        } else {
          items = [
            ...order.items,
            {
              id: order.items.length + 1,
              ...orderItem,
            },
          ];
        }

        order.items = items;
        const updatedOrder =
          await this.convertItemsIdToObjectIdsAndCalculateTotals(order);

        await OrderModel.updateOne(
          { _id: order._id },
          {
            items: updatedOrder.items,
            shipping: updatedOrder.shipping,
            grandTotal: updatedOrder.grandTotal,
            subTotal: updatedOrder.subTotal,
          }
        );
        const orderWithDetail = await this.findOrderWithProductAndUserDetail({
          _id: order._id,
        });
        await this.updateSingleProductQuantity(
          req,
          orderItem.productId as any,
          -orderItem.quantity
        );

        await NotificationUtils.sendOrderUpdate(req, orderWithDetail[0]);
        return {
          message: "Order Item added successfully.",
          success: true,
          data: orderWithDetail[0],
        };
      }
      return {
        message: "No Such order.",
        success: false,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while add new item to order",
        success: false,
      };
    }
  }

  public async getDeliveryCharges() {
    const appConfig = await AppConfigModel.find({});
    let deliveryCharges: any = {
      minAmount: 0,
      chargeAmount: 0,
      chargePerKm: 0,
    };
    if (appConfig.length > 0) {
      deliveryCharges = appConfig[0].deliveryCharge;
    }

    return deliveryCharges;
  }

  public async updateOrderItem(req: Request): Promise<IReturnData<Order>> {
    try {
      const { orderid } = req.params;
      const orderItem = req.body;
      const order = await OrderModel.findOne({ _id: parseInt(orderid) });

      if (order) {
        const prevOrderItemQuantity =
          order.items.find((item) => item.id === orderItem.id)?.quantity || 0;
        const quantityDiff = prevOrderItemQuantity - orderItem.quantity;
        const productId = orderItem.productId;
        order.items = order.items.map((item) =>
          item.id === orderItem.id ? orderItem : item
        );
        const updatedOrder =
          await this.convertItemsIdToObjectIdsAndCalculateTotals(order);

        await OrderModel.updateOne(
          { _id: order._id },
          {
            items: updatedOrder.items,
            shipping: updatedOrder.shipping,
            grandTotal: updatedOrder.grandTotal,
            subTotal: updatedOrder.subTotal,
          }
        );
        const orderWithDetail = await this.findOrderWithProductAndUserDetail({
          _id: order._id,
        });
        console.log(
          `Product to be update ${productId} and quantity is ${quantityDiff}`
        );
        await this.updateSingleProductQuantity(req, productId, quantityDiff);
        await NotificationUtils.sendOrderUpdate(req, orderWithDetail[0]);
        return {
          message: "Order Item updated successfully.",
          success: true,
          data: orderWithDetail[0],
        };
      }
      return {
        message: "No Such order.",
        success: false,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while add new item to order",
        success: false,
      };
    }
  }

  public async updateSingleProductQuantity(
    req: Request,
    productId: string,
    quantityDiff: number
  ) {
    //updateProductItemQuantity
    await ProductModel.updateOne(
      { _id: productId },
      { $inc: { "sku.quantity": quantityDiff } }
    );

    const updatedProduct = await ProductModel.findOne(
      { _id: productId },
      { "sku.quantity": 1 }
    );
    if (updatedProduct) {
      await NotificationUtils.sendProductQuantityUpdates(
        [updatedProduct as any],
        req
      );
    }
  }

  public async deleteOrderItem(req: Request): Promise<IReturnData<Order>> {
    try {
      const { orderid, itemid } = req.params;

      const order = await OrderModel.findOne({ _id: parseInt(orderid) });

      if (order) {
        const itemTobeDelete = order.items.find(
          (item) => item.id === parseInt(itemid)
        );
        order.items = order.items.filter(
          (item) => item.id !== parseInt(itemid)
        );
        const updatedOrder =
          await this.convertItemsIdToObjectIdsAndCalculateTotals(order);

        await OrderModel.updateOne(
          { _id: order._id },
          {
            items: updatedOrder.items,
            shipping: updatedOrder.shipping,
            grandTotal: updatedOrder.grandTotal,
            subTotal: updatedOrder.subTotal,
          }
        );
        const orderWithDetail = await this.findOrderWithProductAndUserDetail({
          _id: order._id,
        });
        if (itemTobeDelete) {
          await this.updateSingleProductQuantity(
            req,
            itemTobeDelete.productId as any,
            itemTobeDelete.quantity
          );
        }

        await NotificationUtils.sendOrderUpdate(req, orderWithDetail[0]);
        return {
          message: "Order Item removed successfully.",
          success: true,
          data: orderWithDetail[0],
        };
      }
      return {
        message: "No Such order.",
        success: false,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while add new item to order",
        success: false,
      };
    }
  }
}
