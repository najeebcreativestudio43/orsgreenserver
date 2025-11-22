import {
  Application,
  RequestHandler,
  Request,
  Response,
  Errback,
  NextFunction,
} from "express";
import mongoose from "mongoose";
import { createServer, Server as HttpServer } from "http";
import Controller from "./Controller";
import createError from "http-errors";
import express from "express";
import * as SocketIO from "socket.io";
const socketIo = require("socket.io");
const expressListRoutes = require("express-list-routes");
import {
  ConnectivityEvents,
  NotificationEvents,
  OrderEvents,
} from "./../sockets/Events";
import { AdminModel, UserModel } from "../models";

export const socketSessionMap: any = {};

export default class Server {
  private app: Application;
  private readonly port: number;

  private readonly mongoUrl: string;
  private mongoOptions: object;

  private httpServer: HttpServer;
  private io: SocketIO.Server;

  constructor(
    app: Application,
    port: number,
    mongoUrl: string,
    mongoOptions: object
  ) {
    this.app = app;
    this.port = port;
    this.mongoUrl = mongoUrl;
    this.mongoOptions = mongoOptions;
    this.httpServer = createServer(this.app);
    this.io = socketIo(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],

        credentials: true,
      },
    });

    this.app.locals.io = this.io;
  }

  private initSocketEvents(): void {
    this.io.on(ConnectivityEvents.CONNECT, async (socket: SocketIO.Socket) => {
      const userId = socket.handshake.query["userId"];
      const role = socket.handshake.query["role"];
      // if (role === "manager") {
      //   const admin = await AdminModel.findOne({ _id: userId });
      //   admin?.setSocketId(socket.id);
      // }
      // if (role === "user") {
      //   const user = await UserModel.findOne({ _id: userId });
      //   user?.setSocketId(socket.id);
      // }
      socketSessionMap["" + userId] = socket.id;
      console.log(JSON.stringify(socketSessionMap, null, 2));

      console.log(
        `User Joind with id= ${userId} and role=${role} socket id = ${socket.id}`
      );

      // if (role === "website") {
      //   socket.join(Room.PRODUCT_REVIEW);
      //   socket.join(Room.WEBSITE);
      // }

      // socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
      //   console.log("[server](message): %s", JSON.stringify(m));
      //   this.io.emit("message", m);
      // });

      socket.on(ConnectivityEvents.DISCONNECT, () => {
        console.log("Client disconnected");
      });
    });
  }

  public run(): HttpServer {
    this.initSocketEvents();
    this.httpServer.listen(this.port, () => {
      console.log(`The server is running on port ${this.port}`);
    });

    return this.httpServer;
  }

  public loadMiddleware(middlewares: Array<RequestHandler>): void {
    this.app.use("/uploads", express.static("uploads"));
    middlewares.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  public loadControllers(controllers: Array<Controller>): void {
    controllers.forEach((controller) => {
      this.app.use(
        `/api/${controller.version}${controller.path}`,
        controller.setRoutes()
      );
    });
  }

  public renderClient(): void {
    this.app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
    this.app.get("/routes", async (req: Request, res: Response) => {
      res.send({
        message: "routes",
        routes: await expressListRoutes(this.app, { prefix: "", spacer: 7 }),
      });
    });
    this.app.get("/", (req: Request, res: Response) => {
      res.send("Server is running");
    });

    // catch 404 and forward to error handler
    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404));
    });

    this.app.use(function (
      err: { status: number; message: string },
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500).json({
        message: `${err.status} ${err.message}`,
      });
    });
  }

  public async initDatabase(): Promise<void> {
    try {
      await mongoose.connect(this.mongoUrl);
      console.log("Database is successfully authenticated");
    } catch (err) {
      console.log(err, "eers");
    }
  }
}
