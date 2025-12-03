import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import config from "../config/config";

export default class LifetimeSmsApiService {
  public static async sendOTP(
    to: string,
    otp: string
  ): Promise<AxiosResponse<any, any>> {
    const from = 8584;
    const eventId = 86;
    const SECRET = config.SMS_API_SECRET;
    const TOKEN = config.SMS_API_TOKEN;
    const message = `Your Oragreen O T P is ${otp}. Kindly do not share your O T P with any other person`;
    
    const url = `https://lifetimesms.com/otp?api_token=${TOKEN}&api_secret=${SECRET}&to=${to}&from=${from}&event_id=${eventId}&message=${message}&data={"code":${otp}}`;
    const result = await axios.get(url);
    return result;
    //   .then((response) => {
    //     res.send({
    //       success: true,
    //       response: req.body,
    //       status: 200,
    //       message: "OTP Send Successfully",
    //     });
    //   })
    //   .catch((error) => {
    //     res.status(500).send({
    //       success: false,
    //       status: 500,
    //       message: error.message || "Can't send OTP at the moment try again!",
    //       response: null,
    //     });
    //   });
  }
}
