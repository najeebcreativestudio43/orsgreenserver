import { modelOptions, prop as Property, Ref, pre } from "@typegoose/typegoose";
import Image from "./Image";
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class SubCategoryGallery {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ _id: true })
  public image!: Image;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;
}

export default SubCategoryGallery;
