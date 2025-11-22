import {
  DocumentType,
  index,
  modelOptions,
  pre,
  prop as Property,
  Ref,
  ReturnModelType,
} from "@typegoose/typegoose";
import { FileUploadService } from "../services";
import Utils from "../Utils/Utils";
import Address from "./Address.class";
import IImage from "./Image";

// @pre<User>("save", async function (next) {
//   if (this.password !== "") {
// console.log("pre calling");
// const hashPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashPassword;
//   }

//   next();
// })

enum Role {
  USER = "user",
}

@index({ email: 1 }, { unique: true })
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class User {
  @Property({ type: () => String })
  public firstName?: string;

  @Property({ type: () => String })
  public lastName?: string;

  @Property({ type: () => String })
  public middleName?: string;

  @Property({ type: () => String, required: true })
  public mobile!: string;

  @Property({ type: () => String })
  public phoneOtp?: string;

  @Property({
    type: () => String,
    lowercase: true,
  })
  public email?: string;

  @Property({ type: () => Date, required: true, default: new Date() })
  public registeredAt?: Date;

  @Property({ type: () => Number })
  public lastLogin?: number;

  @Property({ _id: false })
  public avatar?: IImage;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ enum: Role, default: Role.USER, type: String })
  public role?: Role;

  @Property({ type: () => String })
  public deviceToken?: string;

  @Property({
    ref: () => Address,
    localField: () => "_id",
    foreignField: () => "userId",
    justOne: false,
  })
  public addresses?: Ref<Address>[];

  @Property({
    ref: () => Address,
    localField: () => "_id",
    foreignField: () => "userId",
    justOne: true,
  })
  public defaultAddress?: Ref<Address>;

  public static async isMobileExist(
    this: ReturnModelType<typeof User>,
    mobile?: string
  ): Promise<boolean> {
    const user = await this.findOne({ mobile }).exec();
    return user !== null;
  }

  public static async findByMobile(
    this: ReturnModelType<typeof User>,
    mobile?: string
  ) {
    return this.findOne({ mobile }).exec();
  }

  public static async removeUserPicture(
    this: ReturnModelType<typeof User>,
    _id: string
  ) {
    const user = await this.findOne({ _id }).exec();
    FileUploadService.deleteFile(user?.avatar);
  }

  public async setLastLogin(this: DocumentType<User>, lastLogin: number) {
    this.lastLogin = lastLogin;
    return await this.save();
  }

  public async setDeviceToken(this: DocumentType<User>, deviceToken: string) {
    this.deviceToken = deviceToken;
    return await this.save();
  }

  public static async getDeviceTokenByUserId(
    this: ReturnModelType<typeof User>,
    _id: string
  ): Promise<string | undefined> {
    const user = await this.findOne({ _id }).exec();
    return user?.deviceToken;
  }
}

export default User;
