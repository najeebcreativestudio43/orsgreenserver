import express, { Application, RequestHandler } from "express";
import cookieParser from "cookie-parser";
import Server from "./server/Server";
import Controller from "./server/Controller";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/config";
import http from "http";
const apiKeyAuth = require("api-key-auth");
import controllers from "./controllers";
import Utils from "./Utils/Utils";
import admin from "./config/firebase-config";

const expressListRoutes = require("express-list-routes");

const app: Application = express();
const { json, urlencoded } = express;

const server: Server = new Server(
  app,
  config.server.port,
  config.mongo.url,
  config.mongo.options
);

const globalMiddleware: Array<RequestHandler> = [
  urlencoded({ extended: false }),
  json(),
  cookieParser(),
  cors({ credentials: true, origin: true }),
  helmet(),
  morgan("combined"),
];

async function auth(key: string, next: Function) {
  if ("test" === key) next(null, { verified: true });
  else next(null, null);
}

Promise.resolve()
  .then(() => server.initDatabase())
  .then(async () => {
    server.loadMiddleware(globalMiddleware);
    server.loadControllers(controllers);
    const httpServer = server.run();
    server.renderClient();

    expressListRoutes(app, { prefix: "", spacer: 7 });

    console.log(
      await Utils.comparePassword(
        "muhammad",
        "$2a$10$TQy2U0Rv6Wf5FrC6vaS7yuS5AtSqkXYah4umOHjoVd0hCb8U7y8Za"
      )
    );
  });
