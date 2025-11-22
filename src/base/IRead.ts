import { FilterQuery, QueryOptions } from "mongoose";
import IReturnData from "./IReturnData";

export default interface IRead<T> {
  find(filter: FilterQuery<any>): Promise<IReturnData<T[]>>;
  findOne(filter: FilterQuery<any>): Promise<IReturnData<T>>;
  findOneById(
    id: string,
    projection?: any | null,
    options?: QueryOptions | null
  ): Promise<IReturnData<T>>;
}
