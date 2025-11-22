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
class Category {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => String })
  public content?: string;

  @Property({ ref: () => CategoryGallery })
  public imageId!: Ref<CategoryGallery>;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;

  @Property({
    ref: () => CategoryGallery,
    localField: "imageId",
    foreignField: "_id",
    justOne: true,
  })
  public image: Ref<CategoryGallery>;
}

export default Category;
