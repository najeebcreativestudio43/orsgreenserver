import { modelOptions, prop as Property, Ref, pre } from "@typegoose/typegoose";
import Image from "./Image";
import Admin from "./Admin.class";
import BrandGallery from "./BrandGallery";
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class Banner {
  @Property({ type: () => String })
  public title?: string;

  @Property({ type: () => String })
  public content?: string;

  @Property({ _id: false, required: true })
  public image!: Image;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;
}

export default Banner;
