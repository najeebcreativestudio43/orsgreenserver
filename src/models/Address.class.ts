import { modelOptions, pre, prop as Property, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./BaseModel.class";

import User from "./User.class";

enum LocationType {
  POLYGON = "Polygon",
  POINT = "Point",
}

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class Address {
  @Property({ type: () => String, required: true })
  public firstName!: string;

  @Property({ type: () => String })
  public middleName?: string;

  @Property({ type: () => String, required: true })
  public lastName!: string;

  @Property({ type: () => String, required: true })
  public mobile!: string;

  @Property({
    type: () => String,
    lowercase: true,
  })
  public email?: string;

  @Property({ type: () => String, required: true })
  public line!: string;

  @Property({ type: () => String, required: true })
  public city!: string;

  @Property({ type: () => String })
  public province?: string;

  @Property({ type: () => String, required: true })
  public country!: string;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ type: () => Boolean, default: false })
  public isDefault?: boolean;

  @Property({ type: () => String })
  public content?: string;

  @Property({ type: () => String, required: true })
  public type!: string;

  @Property({ type: () => String, required: true })
  public gender!: string;

  @Property({ type: () => String, required: true })
  public apartment!: string;

  @Property({ type: Object })
  location!: {
    type: string;
    coordinates: [number, number];
  };

  @Property({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @Property({
    ref: () => User,
    localField: () => "userId",
    foreignField: () => "_id",
    justOne: true,
  })
  public user?: Ref<User>;
}

export default Address;
