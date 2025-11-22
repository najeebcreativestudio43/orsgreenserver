import { getModelForClass } from "@typegoose/typegoose";
import { IModelOptions } from "@typegoose/typegoose/lib/types";
import Address from "./Address.class";
import Cart from "./Cart.class";
import Category from "./Category.class";
import Inventory from "./Inventory.class";
import Order, { OrderItem } from "./Order.class";
import Product from "./Product.class";

import ProductReview from "./ProductReview.class";
import Promotion from "./Promotion.class";
import Transcation from "./Transaction.class";
import User from "./User.class";
import Whishlist from "./Whishlist.class";
import Image from "./Image";
import Brand from "./Brand.class";
import IDistinctColor from "./IDistinctColor";
import IDistinctTag from "./IDistinctTag";
import Payment from "./Payment.class";
import Admin from "./Admin.class";
import SubCategory from "./SubCategory.class";
import ProductCategory from "./ProductCategory.class";
import BrandGallery from "./BrandGallery";
import CategoryGallery from "./CategoryGallery";
import SubCategoryGallery from "./SubCategoryGallery";
import ProductGallery from "./ProductGallery";
import Notification from "./Notification.class";
import AppConfig from "./AppConfig.class";
import Banner from "./Banner.class";
import Favorite from "./Favorite.class";
import GeneralNotificationGallery from "./GeneralNotificationGallery";
import Purchase, { PurchaseItem } from "./Purchase.class";

const options: IModelOptions = {
  schemaOptions: { timestamps: true },
};

const AdminModel = getModelForClass(Admin, options);
const UserModel = getModelForClass(User, options);
const AddressModel = getModelForClass(Address, options);
const ProductModel = getModelForClass(Product, options);
const CategoryModel = getModelForClass(Category, options);
const SubCategoryModel = getModelForClass(SubCategory, options);
const ProductCategoryModel = getModelForClass(ProductCategory, options);
const InventoryModel = getModelForClass(Inventory, options);
const WhishlistModel = getModelForClass(Whishlist, options);
const PromotionModel = getModelForClass(Promotion, options);
const OrderModel = getModelForClass(Order, options);
const ProductReviewModel = getModelForClass(ProductReview, options);
const TransactionModel = getModelForClass(Transcation, options);
const CartModel = getModelForClass(Cart, options);
const BrandModel = getModelForClass(Brand, options);
const BrandGalleryModel = getModelForClass(BrandGallery, options);
const CategoryGalleryModel = getModelForClass(CategoryGallery, options);
const SubCategoryGalleryModel = getModelForClass(SubCategoryGallery, options);
const PaymentModel = getModelForClass(Payment, options);
const ProductGalleryModel = getModelForClass(ProductGallery, options);
const NotificationModel = getModelForClass(Notification, options);
const AppConfigModel = getModelForClass(AppConfig, options);
const BannerModel = getModelForClass(Banner, options);
const FavoriteModel = getModelForClass(Favorite, options);
const GeneralNotificationGalleryModel = getModelForClass(
  GeneralNotificationGallery,
  options
);

const PurchaseModel = getModelForClass(Purchase, options);

export {
  Admin,
  AdminModel,
  User,
  UserModel,
  Address,
  AddressModel,
  Product,
  ProductModel,
  Category,
  CategoryModel,
  SubCategory,
  SubCategoryModel,
  ProductCategory,
  ProductCategoryModel,
  Inventory,
  InventoryModel,
  Whishlist,
  WhishlistModel,
  Promotion,
  PromotionModel,
  Order,
  OrderModel,
  ProductReview,
  ProductReviewModel,
  Transcation,
  TransactionModel,
  Cart,
  CartModel,
  Image,
  Brand,
  BrandModel,
  IDistinctColor,
  IDistinctTag,
  Payment,
  PaymentModel,
  BrandGallery,
  BrandGalleryModel,
  CategoryGallery,
  CategoryGalleryModel,
  SubCategoryGallery,
  SubCategoryGalleryModel,
  ProductGallery,
  ProductGalleryModel,
  Notification,
  NotificationModel,
  AppConfig,
  AppConfigModel,
  Banner,
  BannerModel,
  Favorite,
  FavoriteModel,
  GeneralNotificationGallery,
  GeneralNotificationGalleryModel,
  OrderItem,
  Purchase,
  PurchaseModel,
  PurchaseItem,
};
