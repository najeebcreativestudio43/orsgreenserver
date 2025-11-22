import { UpdateWriteOpResult } from "mongoose";
import { IReturnData, IWrite } from "../base";
import { Cart, CartModel, ProductModel } from "../models";
import Utils from "../Utils/Utils";
import { BaseService } from "./BaseService";

export default class CartService extends BaseService<Cart> {
  constructor(public readonly cart?: Cart) {
    super(CartModel.modelName);
  }

  async findOneOrCreateByUserId(userId: string): Promise<IReturnData<Cart>> {
    try {
      const item: Cart | null = await CartModel.findOne({
        userId: userId,
      });
      if (item) {
        return { message: "User cart", success: true, data: item };
      } else {
        const newItem = await CartModel.create({
          userId: userId,
          items: [],
        });
        return { message: "User cart", success: true, data: newItem };
      }
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting item",
        success: false,
      };
    }
  }

  async addItem(_id: string, item: any): Promise<IReturnData<Cart>> {
    try {
      const existingCartItem = await CartModel.findOne({
        _id,
        "items.sku": item.sku,
      });

      if (existingCartItem) {
        const newItems = existingCartItem.items.map((eitem) =>
          eitem.sku === item.sku ? item : eitem
        );
        await CartModel.updateOne(
          { _id },
          {
            $set: { items: newItems },
          }
        );
      } else {
        await CartModel.updateOne(
          { _id },
          {
            $push: { items: { ...item } },
          }
        );
      }

      const cartItem: Cart | null = await CartModel.findById(_id);
      if (cartItem) {
        return {
          message: "Cart item inserted successfully",
          data: cartItem,
          success: true,
        };
      }

      return { message: "Can't add item to the cart", success: false };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while adding item to cart.",
        success: false,
      };
    }
  }

  async removeItemByIdAndSku(
    _id: string,
    sku: string
  ): Promise<IReturnData<Cart>> {
    try {
      const result = await CartModel.updateOne(
        { _id },
        {
          $pull: {
            items: {
              sku: sku,
            },
          },
        }
      );

      const cartItem: Cart | null = await CartModel.findById(_id);
      if (cartItem) {
        return {
          message: "Cart item removed successfully",
          data: cartItem,
          success: true,
        };
      }

      return { message: "Can't removed item from the cart", success: false };
    } catch (err) {
      return {
        message: "An error accord while remove item from cart",
        success: false,
      };
    }
  }

  async cleartItems(_id: string): Promise<IReturnData<Cart>> {
    try {
      const result = await CartModel.updateOne(
        { _id },
        {
          $set: { items: [] },
        }
      );

      const cartItem: Cart | null = await CartModel.findById(_id);
      if (cartItem) {
        return {
          message: "Cart cleared successfully",
          data: cartItem,
          success: true,
        };
      }

      return { message: "Can't clear cart", success: false };
    } catch (err) {
      return {
        message: "An error accord while remove item from cart",
        success: false,
      };
    }
  }

  async updateItemsById(_id: string, items: any): Promise<IReturnData<Cart>> {
    try {
      const result = await CartModel.updateOne(
        { _id },
        {
          $set: { items: items },
        }
      );

      const cartItem: Cart | null = await CartModel.findById(_id);
      if (cartItem) {
        return {
          message: "Cart updated successfully",
          data: cartItem,
          success: true,
        };
      }

      return { message: "Can't clear cart", success: false };
    } catch (err) {
      return {
        message: "An error accord while remove item from cart",
        success: false,
      };
    }
  }
}
