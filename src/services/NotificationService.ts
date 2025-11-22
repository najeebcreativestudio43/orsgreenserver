import { Types } from "mongoose";
import { IReturnData } from "../base";
import NotificationUtils from "./../notifications/NotificationUtils";
import {
  Admin,
  AdminModel,
  Notification,
  NotificationModel,
  User,
  UserModel,
} from "../models";
import { BaseService } from "./BaseService";
import { WhichUser } from "../models/Notification.class";
import { Request } from "express";
import FirebaseService from "../firebase/FirebaseService";

export default class NotificationService extends BaseService<Notification> {
  constructor() {
    super(NotificationModel.modelName);
  }
  public async findByIdWithUser(id: string): Promise<any> {
    return await NotificationModel.findById(id);
  }

  public async findAllByReceoverId(
    id: string
  ): Promise<IReturnData<Notification>> {
    try {
      const notifications: Notification[] = await NotificationModel.find(
        {
          receiverIds: { $in: [Types.ObjectId(id) as any] },
          isRead: false,
        },
        { receiverIds: 0 }
      )
        .sort({ createdAt: -1 })
        .exec();

      const users: any[] = [];
      for (var index = 0; index < notifications.length; index++) {
        let user: User | Admin | null = null;
        const notification = notifications[index];
        if (notification.whichUser === WhichUser.Admin) {
          user = await AdminModel.findById(notification.senderId);
        } else if (notification.whichUser === WhichUser.User) {
          user = await UserModel.findById(notification.senderId);
        }
        if (user) {
          users.push(user);
        }
      }

      return {
        message: "Notifications",
        success: true,
        data: notifications.map((notification: any, index: number) => {
          return {
            ...JSON.parse(JSON.stringify(notification)),
            user: users[index],
            message: NotificationUtils.generateNotificationMessage(
              notification.entityType,
              users[index],
              "HNT-" + notification.entityId
            ),
          };
        }),
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An error accord while retreving user notification",
        success: false,
      };
    }
  }
}
