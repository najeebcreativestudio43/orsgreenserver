import { modelOptions, prop as Property, Ref, pre } from "@typegoose/typegoose";
import Admin from "./Admin.class";
import Category from "./Category.class";
import SubCategoryGallery from "./SubCategoryGallery";
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class SubCategory {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => String })
  public content?: string;

  @Property({ ref: () => SubCategoryGallery })
  public imageId!: Ref<SubCategoryGallery>;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;

  @Property({ ref: () => Category, required: true })
  public categoryId: Ref<Category>;

  @Property({
    ref: () => SubCategoryGallery,
    localField: "imageId",
    foreignField: "_id",
    justOne: true,
  })
  public image: Ref<SubCategoryGallery>;

  @Property({
    ref: () => Category,
    localField: "categoryId",
    foreignField: "_id",
    justOne: true,
  })
  public category: Ref<Category>;
}

export default SubCategory;
