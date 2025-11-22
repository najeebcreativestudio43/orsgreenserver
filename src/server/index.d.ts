import { Admin, User } from "../models";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}
declare namespace NodeJS {
  export interface ProcessEnv {
    SERVER_PORT: number;
  }
}

export interface ISafeData {
  user?: User;
  jwt?: string;
}
