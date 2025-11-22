import { ReturnModelType } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from "mongoose";
import IReturnData from "./IReturnData";

export default interface IWrite<T> {
  create(item: T): Promise<IReturnData<T>>;
  update(
    filter: FilterQuery<any>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline | undefined,
    options?: QueryOptions | null
  ): Promise<IReturnData<T>>;
  deleteOneById(id: string): Promise<IReturnData<T>>;
  delete(
    filter: FilterQuery<any>,
    options?: QueryOptions | undefined
  ): Promise<IReturnData<T>>;
}
