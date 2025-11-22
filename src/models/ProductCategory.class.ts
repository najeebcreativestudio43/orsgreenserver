import {
  modelOptions,
  prop as Property,
  Ref,
  pre,
  Prop,
} from "@typegoose/typegoose";
import Admin from "./Admin.class";
import Category from "./Category.class";
import SubCategory from "./SubCategory.class";

// @pre<Category>("save", function () {
//   if (this.parentId !== null) {
//     this.parentId = Utils.getObjectId("" + this.parentId);
//   }
// })
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class ProductCategory {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => String })
  public content?: string;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;

  @Property({ ref: () => SubCategory, required: true })
  public subCategoryId: Ref<SubCategory>;

  @Property({ ref: () => Category, required: true })
  public categoryId: Ref<Category>;

  @Property({
    ref: () => Category,
    localField: "categoryId",
    foreignField: "_id",
    justOne: true,
  })
  public category: Ref<Category>;

  @Property({
    ref: () => SubCategory,
    localField: "subCategoryId",
    foreignField: "_id",
    justOne: true,
  })
  public subCategory: Ref<Category>;
}

export default ProductCategory;
