import { modelOptions, prop as Property, Ref, pre } from "@typegoose/typegoose";
import Admin from "./Admin.class";
import CategoryGallery from "./CategoryGallery";
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class DeliveryCharges {
  @Property({ type: () => Number, required: true })
  public minAmount!: number;

  @Property({ type: () => Number, required: true })
  public chargeAmount?: number;

  @Property({ type: () => Number, required: true })
  public chargePerKm?: number;
}

class AppConfig {
  @Property({ _id: false })
  public deliveryCharge?: DeliveryCharges;
}

export default AppConfig;
