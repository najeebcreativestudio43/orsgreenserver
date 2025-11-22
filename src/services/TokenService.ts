import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import config from "../config/config";
import { User } from "../models";
export default class Token {
  public static verify(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }
    const token = header.split(" ")[1];
    jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, decodedFromToken) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: "Failed to verify token",
        });
        return;
      } else {
        const decoded = <{ user: object }>decodedFromToken;
        const decodedUser = <any>decoded.user;
        req.user = decodedUser;
        next();
      }
    });
  }

  public static verifyApiKey(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: "No api key provided",
      });
      return;
    }

    jwt.verify(
      apiKey as string,
      config.API_KEY_SECRET,
      (err, decodedFromToken) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: "Invalid Api key",
          });
          return;
        } else {
          const decoded = <{ type: string; title: string }>decodedFromToken;

          if (decoded.type === "app") next();
          else {
            res.status(401).json({
              success: false,
              message: "Invalid Api key",
            });
          }
        }
      }
    );
  }
}
