import {
  AutoIncrementIDOptions,
  AutoIncrementID,
} from "@typegoose/auto-increment";

import { prop, plugin } from "@typegoose/typegoose";

@plugin(AutoIncrementID, { startAt: 1, incrementBy: 1 })
export class BaseModel {
  @prop()
  _id!: number;
}
