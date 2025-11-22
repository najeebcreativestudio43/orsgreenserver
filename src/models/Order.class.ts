import { prop as Property, Ref, plugin } from "@typegoose/typegoose";
import { Types } from "mongoose";
import Admin from "./Admin.class";
import { BaseModel } from "./BaseModel.class";
import Brand from "./Brand.class";
import Category from "./Category.class";
import Product from "./Product.class";
import ProductCategory from "./ProductCategory.class";
import SubCategory from "./SubCategory.class";
import User from "./User.class";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
enum Status {
  NEW = "new",
  PENDING = "pending",
  PROGRESS = "progress",
  CANCELED = "canceled",
  RECEIVED = "received",
  DELIVERED = "delivered",
  DECLINED = "declined",
}

class ShippingInfo {
  @Property({ type: () => String, required: true, trim: true })
  public firstName!: string;
  @Property({ type: () => String, required: true, trim: true })
  public lastName!: string;
  @Property({ type: () => String, trim: true })
  middleName?: string;

  @Property({ type: () => String, required: true, trim: true })
  public mobile!: string;

  @Property({ type: () => String, trim: true })
  public email?: string;
  @Property({ type: () => String, required: true, trim: true })
  public line!: string;

  @Property({ type: () => String, required: true, trim: true })
  public city!: string;

  @Property({ type: () => String, trim: true })
  public province?: string;

  @Property({ type: () => String, required: true, trim: true })
  public country!: string;

  @Property({ type: () => String, required: true })
  public type!: string;

  @Property({ type: () => String, required: true })
  public gender!: string;

  @Property({ type: () => String, required: true })
  public apartment!: string;

  @Property({ type: Object, required: true })
  public location!: {
    type: string;
    coordinates: [number, number];
  };
}

class Color {
  @Property({ type: () => String, required: true })
  public name!: string;
}

class Size {
  @Property({ type: () => String, required: true })
  public label!: string;

  @Property({ type: () => String, required: true })
  public shortLabel!: string;
}

class Price {
  @Property({ type: () => Number, required: true })
  public base!: number;

  @Property({ type: () => Number, required: true })
  public sale!: number;

  @Property({ type: () => String, required: true })
  public discount!: number;
}

export class OrderItem {
  @Property({ type: () => Number, required: true })
  public id!: number;

  @Property({
    ref: () => Product,
    required: true,
  })
  public productId!: Ref<Product>;

  @Property({ type: () => Number, required: true, min: 1, default: 1 })
  public quantity!: number;

  @Property({ _id: false })
  public color?: Color;

  @Property({ _id: false })
  public size?: Size;

  @Property({ _id: false, required: true })
  public price!: Price;

  @Property({ ref: () => Category, required: true })
  public categoryId!: Ref<Category>;

  @Property({ ref: () => SubCategory, required: true })
  public subCategoryId!: Ref<SubCategory>;

  @Property({ ref: () => ProductCategory, required: true })
  public productCategoryId!: Ref<ProductCategory>;

  @Property({ ref: () => Brand, required: true })
  public brandId!: Ref<Brand>;
}

@plugin(aggregatePaginate)
@plugin(mongoosePaginate)
class Order extends BaseModel {
  @Property({ type: () => String, default: "" })
  public invoiceNo?: string;

  @Property({ type: () => String, default: Status.NEW, enum: Status })
  public status?: Status;

  @Property({ type: () => String })
  public declinedReason?: string;

  @Property({ type: () => Number, required: true })
  public subTotal!: number;

  @Property({ type: () => Number, default: 0 })
  public tax?: number;

  @Property({ type: () => Number, default: 0 })
  public shipping?: number;

  @Property({ type: () => Number, default: 0.0 })
  public flatDiscount!: number;

  @Property({ type: () => Number, required: true })
  public grandTotal!: number;

  @Property({ _id: false, required: true })
  public shippingInfo!: ShippingInfo;

  @Property({ _id: true, required: true })
  public items!: OrderItem[];

  @Property({ type: () => String })
  public orderNote?: string;

  @Property({ ref: () => User })
  public userId: Ref<User>;

  @Property({
    ref: () => User,
    foreignField: () => "_id",
    localField: () => "userId",
    justOne: true,
  })
  public user: Ref<User>;

  @Property({ ref: () => Admin })
  public adminId: Ref<Admin>;
}

export default Order;
