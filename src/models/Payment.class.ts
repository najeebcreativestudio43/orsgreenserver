import { modelOptions, pre, prop as Property, Ref } from "@typegoose/typegoose";
import User from "./User.class";

@modelOptions({
  schemaOptions: { toJSON: { virtuals: true }, toObject: { virtuals: true } },
})
class Payment {
  @Property({ type: () => String, required: true })
  public status!: string;

  @Property({ type: () => String, required: true })
  public gateway!: string;

  @Property({ type: () => String, required: true })
  public type!: string;

  @Property({ type: () => Number, default: 0 })
  public amount!: number;

  @Property({ required: true })
  public card!: {
    brand: string;
    panLastFour: string;
    expirationMonth: number;
    expirationYear: number;
    cvvVerified: boolean;
  };

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ type: () => Boolean, default: false })
  public isDefault?: boolean;

  @Property({ type: () => String })
  public content?: string;

  @Property({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @Property({
    ref: () => User,
    localField: () => "userId",
    foreignField: () => "_id",
    justOne: true,
  })
  public user: Ref<User>;
}

export default Payment;
