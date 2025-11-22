import { prop as Property, Ref } from "@typegoose/typegoose";
import Order from "./Order.class";
import User from "./User.class";

enum Type {
  CREDIT,
  DEBIT,
}

enum Mode {
  OFFLINE,
  CASH_ON_DELIVERY,
  CHEQUE,
  DRAFT,
  WIRED,
  ONLINE,
}

enum Status {
  NEW,
  CANCELLED,
  FAILED,
  PENDING,
  DECLINED,
  REJECTED,
  SUCCESS,
}

class Transcation {
  @Property({ type: () => String, required: true })
  public code!: string;

  @Property({ type: () => Number, default: Type.CREDIT })
  public type?: number;

  @Property({ type: () => Number, default: Mode.CASH_ON_DELIVERY })
  public mode?: number;

  @Property({ type: () => Number, default: Status.NEW })
  public status?: number;

  @Property({ type: () => String })
  public content?: string;

  @Property({ ref: () => Order })
  public orderId: Ref<Order>;

  @Property({
    ref: () => Order,
    foreignField: () => "_id",
    localField: () => "orderId",
    justOne: true,
  })
  public order: Ref<Order>;

  @Property({ ref: () => User })
  public userId: Ref<User>;

  @Property({
    ref: () => User,
    foreignField: () => "_id",
    localField: () => "userId",
    justOne: true,
  })
  public user: Ref<User>;
}

export default Transcation;
