import { modelOptions, prop as Property, Ref, pre } from "@typegoose/typegoose";
import Admin from "./Admin.class";
import User from "./User.class";

export enum WhichEntity {
  ORDER = "Order",
  PRODUCT = "Product",
  UPDATE = "Update",
}

export enum WhichUser {
  User = "User",
  Admin = "Admin",
}

export enum EntityType {
  ORDER_NEW = "new_order",
  ORDER_PROGRESS = "progress_order",
  ORDER_PENDING = "pending_order",
  ORDER_RECEIVED = "received_order",
  ORDER_DELIVERED = "delivered_order",
  ORDER_DECLINED = "declined_order",
  APP_UPDATE = "app_update",
  PRODUCT = "product",
}

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class Notification {
  @Property({ type: () => String })
  public title?: string;

  @Property({ type: () => String })
  public body?: string;

  @Property({ type: () => String })
  public image?: string;

  @Property({ required: true, enum: WhichUser })
  public whichUser!: string;
  @Property({ required: true, enum: WhichEntity })
  public which!: string;

  @Property({ required: true, enum: EntityType })
  public entityType!: string;

  @Property({ type: () => String })
  public entityId?: String;

  @Property({ type: () => Boolean, default: false })
  public isRead?: boolean;

  @Property({ type: () => String, required: true })
  public senderId!: string;

  @Property({})
  public user?: User | Admin;

  @Property({})
  public receiverIds!: string[];
}

export default Notification;
