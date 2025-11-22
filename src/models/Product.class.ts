import {
  modelOptions,
  prop as Property,
  Ref,
  plugin,
  index,
} from "@typegoose/typegoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import Category from "./Category.class";
import IImage from "./Image";
import mongoosePaginate from "mongoose-paginate-v2";
import Brand from "./Brand.class";
import ProductGallery from "./ProductGallery";
import SubCategory from "./SubCategory.class";
import ProductCategory from "./ProductCategory.class";
import Admin from "./Admin.class";

class Price {
  @Property({ type: () => Number, required: true, default: 0 })
  public base!: number;

  @Property({ type: () => Number, required: true, default: 0 })
  public discount!: number;

  @Property({ type: () => Number, required: true, default: 0 })
  public vender!: number;

  @Property({ type: () => Number, required: true, default: 0 })
  public sale!: number;
}

class Size {
  @Property({ type: () => String, required: true })
  public label!: string;

  @Property({ type: () => String, required: true })
  public shortLabel!: string;
}

class Color {
  @Property({ type: () => String, required: true })
  public name!: string;
}

class Feature {
  @Property({ type: () => String, required: true })
  public label!: string;

  @Property({ type: () => String, required: true })
  public content!: string;
}

class Options {
  @Property({ _id: false, default: [] })
  public sizes?: Size[];

  @Property({ _id: false, default: [] })
  public colors?: Color[];

  @Property({ _id: false, default: [] })
  public features?: Feature[];
}

class Sku {
  @Property({ _id: false })
  public price!: Price;

  @Property({ type: () => Number, required: true, default: 0 })
  public quantity!: number;

  @Property({ _id: false })
  public options?: Options;
}

@plugin(mongoosePaginate)
@plugin(aggregatePaginate)
@index({ title: "text", measurement: "text" })
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class Product {
  @Property({ type: () => String, required: true })
  public title!: string;

  @Property({ type: () => String })
  public measurement?: string;

  @Property({ type: () => String, required: true })
  public saleType!: string;

  @Property({ type: () => String })
  public summary?: string;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ type: () => String })
  public content?: string;

  @Property({ type: () => [String] })
  public tags!: String[];

  @Property({ ref: () => ProductGallery })
  public imageId: Ref<ProductGallery>;

  @Property({
    ref: () => ProductGallery,
    foreignField: "_id",
    localField: "imageId",
    justOne: true,
  })
  public image?: Ref<ProductGallery>;

  @Property({ ref: () => Category })
  public categoryId?: Ref<Category>;

  @Property({
    ref: () => Category,
    foreignField: "_id",
    localField: "categoryIds",
    justOne: true,
  })
  public category?: Ref<Category>;

  @Property({ ref: () => SubCategory })
  public subCategoryId: Ref<SubCategory>;

  @Property({
    ref: () => SubCategory,
    foreignField: "_id",
    localField: "subCategoryId",
    justOne: true,
  })
  public subCategory?: Ref<SubCategory>;

  @Property({ ref: () => ProductCategory })
  public productCategoryId: Ref<ProductCategory>;

  @Property({
    ref: () => ProductCategory,
    localField: "productCategoryId",
    foreignField: "_id",
    justOne: true,
  })
  public productCategory?: Ref<ProductCategory>;

  @Property({ ref: () => Brand })
  public brandId?: Ref<Brand>;

  @Property({
    ref: () => Brand,
    foreignField: "_id",
    localField: "brandId",
    justOne: true,
  })
  public brand?: Ref<Brand>;

  @Property({ ref: () => Admin, required: true })
  public adminId: Ref<Admin>;

  @Property({ _id: false, required: true })
  public sku!: Sku;
}

export default Product;
