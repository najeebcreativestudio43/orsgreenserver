import { prop as Property, Ref } from "@typegoose/typegoose";
import User from "./User.class";
import Product from "./Product.class";

class Favorite {
  @Property({ ref: () => Product })
  public productId: Ref<Product>;

  @Property({ ref: () => User })
  public userId: Ref<User>;

  @Property({
    ref: () => Product,
    foreignField: () => "_id",
    localField: () => "productId",
    justOne: true,
  })
  public product: Ref<Product>;

  @Property({
    ref: () => User,
    foreignField: () => "_id",
    localField: () => "userId",
    justOne: true,
  })
  public user: Ref<User>;
}

export default Favorite;
