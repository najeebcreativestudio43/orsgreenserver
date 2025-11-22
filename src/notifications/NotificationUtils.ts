import {
  AdminModel,
  Notification,
  NotificationModel,
  Order,
  User,
  Admin,
  UserModel,
  Product,
} from "./../models";
import {
  EntityType,
  WhichEntity,
  WhichUser,
} from "./../models/Notification.class";
import {
  NotificationEvents,
  OrderEvents,
  ProductEvent,
} from "./../sockets/Events";
import { NotificationService } from "./../services";
import { Request } from "express";
import { Types } from "mongoose";
import { socketSessionMap } from "../server/Server";
import FirebaseService from "../firebase/FirebaseService";

export default class NotificationUtils {
  public static async createOrderNotification(
    req: Request,
    order: Order,
    entityType: string,
    receiverIds: string[],
    senderId: string,
    whichUser: WhichUser
  ): Promise<Notification | undefined> {
    try {
      const notificationService = new NotificationService();

      const newNotification: Notification = {
        whichUser: whichUser,
        which: WhichEntity.ORDER,
        entityType: entityType,
        entityId: (order as any)._id,
        senderId: senderId,
        receiverIds,
      };

      const notificationData = await notificationService.create(
        newNotification
      );

      let user: User | Admin | null;
      console.log(whichUser === WhichUser.Admin);
      if (whichUser === WhichUser.Admin) {
        user = await AdminModel.findById(senderId);
      } else if (whichUser === WhichUser.User) {
        user = await UserModel.findById(senderId);
      }
      const notificationWithUser: Notification = {
        user: user!,
        ...(notificationData.data._doc! as any),
      };

      const message = this.generateNotificationMessage(
        notificationWithUser.entityType,
        notificationWithUser.user,
        order.invoiceNo
      );
      const notification = {
        ...JSON.parse(JSON.stringify(notificationWithUser)),
        message: message,
      };

      switch (entityType) {
        case EntityType.ORDER_NEW:
          {
            receiverIds.forEach((r) => {
              const socketId = socketSessionMap[r];
              req.app.locals.io
                .to(socketId)
                .emit(OrderEvents.CREATE_NEW, order);
              req.app.locals.io
                .to(socketId)
                .emit(NotificationEvents.CREATE_NEW, notification);
            });
          }
          break;
        case EntityType.ORDER_DECLINED:
        case EntityType.ORDER_DELIVERED:
        case EntityType.ORDER_PROGRESS:
          {
            receiverIds.forEach(async (r) => {
              const socketId = socketSessionMap[r];

              req.app.locals.io.to(socketId).emit(OrderEvents.UPDATE, order);
              req.app.locals.io
                .to(socketId)
                .emit(NotificationEvents.CREATE_NEW, notification);
            });

            const service = new FirebaseService();
            const deviceToken = await UserModel.getDeviceTokenByUserId(
              receiverIds[0]
            );
            if (deviceToken) {
              await service.sendMessage(deviceToken, {
                notification: {
                  title: this.getName(notificationWithUser.user),
                  body: message,
                },
                data: {
                  notification: JSON.stringify(notification),
                },
              });
            }
          }
          break;
        case EntityType.ORDER_RECEIVED:
          {
            //send notification to receiver via socket
            receiverIds.forEach((r) => {
              const socketId = socketSessionMap[r];
              req.app.locals.io.to(socketId).emit(OrderEvents.UPDATE, order);
              req.app.locals.io
                .to(socketId)
                .emit(NotificationEvents.CREATE_NEW, notification);
            });
          }
          break;
      }

      return notification;
    } catch (err: any) {
      console.log("Erro notifiation sending", err.message);
      return undefined;
    }
  }

  public static instanceOfAdmin(object: any): object is Admin {
    return "store" in object;
  }

  public static getName(user?: User | Admin | null): string {
    return !this.instanceOfAdmin(user)
      ? `${user?.firstName} ${user?.lastName}`
      : `${user?.store?.name} `;
  }

  public static async sendProductNotification(
    req: Request
  ): Promise<Notification | undefined> {
    try {
      const { title, body, image, entityId } = req.body;
      const { adminid } = req.params;
      const notificationService = new NotificationService();

      const users = await UserModel.find(
        {
          deviceToken: { $exists: true },
        },
        { deviceToken: 1 }
      );

      const userIds = users.map((user) => Types.ObjectId(user._id));
      const registrationTokenOrTokens = users.map((user) => user?.deviceToken!);

      const newNotification: Notification = {
        title,
        body,
        image,
        whichUser: WhichUser.Admin,
        which: WhichEntity.PRODUCT,
        entityType: EntityType.PRODUCT,
        entityId: entityId,
        senderId: adminid,
        receiverIds: userIds as any,
      };

      console.log(newNotification);
      const notificationData = await notificationService.create(
        newNotification
      );

      const user = await AdminModel.findById(adminid);
      const notificationWithUser: Notification = {
        user: user || undefined,
        ...(notificationData.data._doc! as any),
      };

      users.forEach(async (user) => {
        const socketId = socketSessionMap[user._id];

        //req.app.locals.io.to(socketId).emit(OrderEvents.UPDATE, order);
        req.app.locals.io
          .to(socketId)
          .emit(NotificationEvents.CREATE_NEW, notificationWithUser);
      });

      const service = new FirebaseService();

      await service.sendMessage(registrationTokenOrTokens, {
        notification: {
          title: notificationWithUser.title,
          body: notificationWithUser.body,
          image: notificationWithUser.image,
        },
        data: {
          notification: JSON.stringify(notificationWithUser),
        },
      });
      return notificationWithUser;
    } catch (err: any) {
      console.log("Error while sending product notification", err.message);
      return undefined;
    }
  }

  public static sendProductQuantityUpdates(products: Product[], req: Request) {
    const socketIds: any[] = Object.values(socketSessionMap);
    socketIds.forEach((socketId) => {
      console.log(`sending to socketId: ${socketId}`);
      req.app.locals.io
        .to(socketId)
        .emit(ProductEvent.PRODUCT_QUANTITY_CHANGE, products);
    });
  }

  public static sendOrderUpdate(req: Request, order: Order) {
    const socketId = socketSessionMap[order.userId as any];
    console.log(`sending update order to socketId: ${socketId}`);
    req.app.locals.io.to(socketId).emit(OrderEvents.UPDATE, order);
  }

  public static generateNotificationMessage(
    entityType: string,
    user?: User | Admin | null,
    extraInfo?: string
  ): string {
    const name = this.getName(user);
    switch (entityType) {
      case EntityType.ORDER_NEW:
        return `${name} has placed new order`;
      case EntityType.ORDER_PROGRESS:
        return `Hey! your order with invoice-#${extraInfo} is in progress now`;
      case EntityType.ORDER_RECEIVED:
        return `Order Received by ${name}`;
      case EntityType.ORDER_DELIVERED:
        return `Hey! your order with invoice-#${extraInfo} has been successfully delivered.`;
      case EntityType.ORDER_DECLINED:
        return `Hey! your order with invoice-#${extraInfo} has been declined. You can check the reason in order detail.`;
      default:
        return "";
    }
  }
}
