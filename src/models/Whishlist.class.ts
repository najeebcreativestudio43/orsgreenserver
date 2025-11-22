import { prop as Property, Ref } from "@typegoose/typegoose";
import Product from "./Product.class";

class Whishlist {
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

export default Whishlist;
