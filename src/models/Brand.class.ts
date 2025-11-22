import {
  modelOptions,
  prop as Property,
  Ref,
  pre,
  plugin,
  index,
} from "@typegoose/typegoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";
import Admin from "./Admin.class";
import BrandGallery from "./BrandGallery";
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
@plugin(mongoosePaginate)
@plugin(aggregatePaginate)
@index({ title: "text" })
class Brand {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => String })
  public content?: string;

  @Property({ ref: () => BrandGallery })
  public imageId!: Ref<BrandGallery>;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;

  @Property({
    ref: () => BrandGallery,
    localField: "imageId",
    foreignField: "_id",
    justOne: true,
  })
  public image: Ref<BrandGallery>;
}

export default Brand;
