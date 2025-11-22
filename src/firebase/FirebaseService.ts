import { Request } from "express";
import {
  MessagingDevicesResponse,
  MessagingOptions,
  MessagingPayload,
} from "firebase-admin/lib/messaging/messaging-api";
import { IReturnData } from "../base";
import admin from "../config/firebase-config";
import { UserModel } from "../models";

export default class FirebaseService {
  constructor() {}
  public sendMessage(
    registrationTokenOrTokens: string | string[],
    payload: MessagingPayload,
    options: MessagingOptions = {}
  ): Promise<MessagingDevicesResponse> {
    return new Promise((resolve, reject) =>
      admin
        .messaging()
        .sendToDevice(registrationTokenOrTokens, payload, {
          priority: "high",
          //timeToLive: 60 * 60 * 24,
          ...options,
        })
        .then((result: any) => resolve(result))
        .catch((err: any) => reject(err))
    );
  }

  public async sendAppNotifications(req: Request): Promise<IReturnData<any>> {
    try {
      const { title, body, data, image } = req.body;
      const users = await UserModel.find(
        {
          deviceToken: { $exists: true },
        },
        { deviceToken: 1 }
      );

      const registrationTokenOrTokens = users.map((user) => user.deviceToken!);
      const firebaseResult = await this.sendMessage(registrationTokenOrTokens, {
        notification: {
          title: title,
          body: body,
          image: image,
        },

        data: {
          notification: JSON.stringify(data),
        },
      });
      return {
        success: true,
        message: "Update notification sent to all users.",
      };
    } catch (err) {
      console.log(err);
      return {
        message:
          "An error accord while sending app update notification to users",
        success: false,
      };
    }
  }
}
