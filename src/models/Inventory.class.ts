import { prop as Property, Ref } from "@typegoose/typegoose";
import Product from "./Product.class";

class Inventory {
  @Property({ type: () => Number, default: 0 })
  public quantity!: number;

  @Property({ type: () => String })
  public content?: string;

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

export default Inventory;
