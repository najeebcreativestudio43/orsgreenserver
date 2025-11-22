import { prop as Property, Ref, plugin } from "@typegoose/typegoose";
import Product from "./Product.class";
import Admin from "./Admin.class";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export class PurchaseItem {
  @Property({ type: () => Number, required: true })
  public id!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public quantity!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public purchasePrice!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public retailPrice!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public salePrice!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public discount!: number;

  @Property({ ref: () => Number, default: 0, required: true })
  public profitPercent!: number;

  @Property({ ref: () => Product })
  public productId: Ref<Product>;

  @Property({
    ref: () => Product,
    foreignField: () => "_id",
    localField: () => "productId",
    justOne: true,
  })
  public product: Ref<Product>;
}

@plugin(aggregatePaginate)
@plugin(mongoosePaginate)
class Purchase {
  @Property({ _id: true, required: true })
  public items!: PurchaseItem[];

  @Property({ ref: () => Number, required: true })
  public serialNo!: number;

  @Property({ ref: () => Admin })
  public adminId: Ref<Admin>;

  @Property({ ref: () => String, required: true })
  public supplierName!: string;

  @Property({ ref: () => Number, default: 0 })
  public total?: number;

  @Property({
    ref: () => Admin,
    foreignField: () => "_id",
    localField: () => "adminId",
    justOne: true,
  })
  public admin: Ref<Admin>;
}

export default Purchase;
