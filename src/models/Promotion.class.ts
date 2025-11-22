import { prop as Property, Ref } from "@typegoose/typegoose";
import Product from "./Product.class";

class Promotion {
  @Property({ type: () => Date, required: true })
  public startsAt!: Date;

  @Property({ type: () => Date, required: true })
  public endsAt!: Date;

  @Property({ type: () => Boolean, default: true })
  public isActive!: boolean;

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

export default Promotion;
