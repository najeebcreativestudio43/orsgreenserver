import { prop as Property, Ref, index } from "@typegoose/typegoose";

import User from "./User.class";

@index({ sku: 1 }, { unique: true })
class Cart {
  @Property({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @Property({ type: () => String })
  public coupon?: string;

  @Property({})
  public items!: {
    sku: string;
    quantity: number;
  }[];
}

export default Cart;
