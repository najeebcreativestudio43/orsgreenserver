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
import Image from "./Image";

enum LocationType {
  POLYGON = "Polygon",
  POINT = "Point",
}

class Address {
  @Property({ type: () => String, required: true })
  line!: string;
  @Property({ type: () => String, required: true })
  city!: string;
  @Property({ type: () => String, required: true })
  country!: string;
  @Property({ type: Object })
  location!: {
    type: LocationType;
    coordinates: [number, number];
  };
}

class Store {
  @Property({ type: () => String, required: true })
  name!: string;
  @Property({ type: () => String, required: true })
  mobile!: string;
  @Property({ type: () => String })
  email?: string;
  @Property({ type: () => String })
  intro?: string;
  @Property({ type: () => String })
  about?: string;
  @Property({ _id: true })
  avatar?: Image;
  @Property({ _id: false })
  address!: Address;
}

// @pre<User>("save", async function (next) {
//   if (this.password !== "") {
// console.log("pre calling");
// const hashPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashPassword;
//   }

//   next();
// })

export enum Role {
  MANAGER = "manager",
  ADMIN = "admin",
}

@index({ username: 1 }, { unique: true })
@index({ "store.address.location": "2dsphere" })
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
})
class Admin {
  @Property({ type: () => String })
  public fullName?: string;

  @Property({
    type: () => String,
    required: true,
    unique: true,
    lowercase: true,
  })
  public username!: string;

  @Property({ _id: false })
  public store!: Store;

  @Property({ type: () => String, required: true })
  public password!: string;

  @Property({ type: () => Date, required: true, default: new Date() })
  public registeredAt?: Date;

  @Property({ type: () => Number })
  public lastLogin?: number;

  @Property({ type: () => Boolean, default: true })
  public isActive?: boolean;

  @Property({ enum: Role, default: Role.MANAGER, type: String })
  public role?: Role;

  @Property({ type: () => String })
  public socketId?: string;

  public static async isUsernameExist(
    this: ReturnModelType<typeof Admin>,
    username: string
  ): Promise<boolean> {
    const user = await this.findOne({ username }).exec();
    return user !== null;
  }

  public static async isOldPasswordMatch(
    this: ReturnModelType<typeof Admin>,
    oldPassword: string,
    _id: string
  ): Promise<boolean> {
    const user = await this.findOne({ _id }).exec();
    const isPasswordEqual = await Utils.comparePassword(
      oldPassword,
      user?.password!
    );
    return isPasswordEqual;
  }

  public static async findByUsername(
    this: ReturnModelType<typeof Admin>,
    username: string
  ) {
    return this.findOne({ username }).exec();
  }

  public static async removeUserPicture(
    this: ReturnModelType<typeof Admin>,
    _id: string
  ) {
    const user = await this.findOne({ _id }).exec();
    FileUploadService.deleteFile(user?.store?.avatar);
    return user;
  }

  public async setLastLogin(this: DocumentType<Admin>, lastLogin: number) {
    this.lastLogin = lastLogin;
    return await this.save();
  }

  public async setSocketId(this: DocumentType<Admin>, socketId: string) {
    this.socketId = socketId;
    return await this.save();
  }
}

export default Admin;
