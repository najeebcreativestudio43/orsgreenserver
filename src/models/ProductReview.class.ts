import { prop as Property, Ref } from "@typegoose/typegoose";
import Product from "./Product.class";

class ProductReview {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => Number, required: true, min: 1, max: 5 })
  public rating!: number;

  @Property({ type: () => Boolean, default: true })
  public published?: boolean;

  @Property({ type: () => Date, default: new Date() })
  public publishedAt?: Date;

  @Property({ type: () => String, required: true })
  public content!: string;

  @Property({ ref: () => ProductReview })
  public parentId: Ref<ProductReview>;

  @Property({ ref: () => Product, required: true })
  public productId: Ref<Product>;

  @Property({
    ref: () => Product,
    foreignField: "_id",
    localField: "parentId",
    justOne: true,
  })
  public product: Ref<Product>;
}

export default ProductReview;
