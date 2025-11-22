import * as bcrypt from "bcryptjs";
import { Types } from "mongoose";
import moment from "moment";
export default class Utils {
  public static async hashPassword(password?: string): Promise<string> {
    return bcrypt.hash(password!, 10);
  }

  public static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  public static getObjectId(str: string) {
    return Types.ObjectId(str);
  }

  public static async comparePassword(
    plainText: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);
  }

  public static generateOTP(otpLength: number = 4) {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < otpLength; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  public static emailPasswordVerificationCode(): string {
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < 8; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }

    return token;
  }

  public static fillEmptyDates(
    $agg: any,
    $defaultData: any,
    from: any,
    to: any
  ) {
    const $aggObj: any = {}; //Taking this as an object for easy checking

    $agg.map((agg: any) => {
      $aggObj[agg.label] = agg; //Making an object from array entries with label as key
    });

    const $loopDate = moment(from);
    const $endDate = moment(to);

    //Starting from from date to to date, checking if any date does not have entry in $aggObje
    while ($endDate.isSameOrAfter($loopDate)) {
      let $aggDate = $loopDate.format("YYYY-MM-DD");

      if (!$aggObj.hasOwnProperty($aggDate)) {
        //If any date does not have entry, creating a new entry from default aggregates and giving it the date as current date
        $aggObj[$aggDate] = {
          label: $aggDate,
          ...$defaultData,
        };
      }
      $loopDate.add(1, "day"); //Incrementing aggregate date
    }

    //Converting back to array and sorting by date
    return Object.values($aggObj).sort((a: any, b: any) =>
      moment(a.label).isBefore(moment(b.label)) ? -1 : 1
    );
  }
}
