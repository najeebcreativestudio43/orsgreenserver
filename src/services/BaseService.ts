// we imported all types from mongodb driver, to use in code
import { getModelForClass, getModelWithString } from "@typegoose/typegoose";
import {
  AnyParamConstructor,
  BeAnObject,
  ReturnModelType,
} from "@typegoose/typegoose/lib/types";
import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { IRead, IReturnData, IWrite } from "../base";
import Utils from "../Utils/Utils";

// that class only can be extended
export abstract class BaseService<T> implements IWrite<T>, IRead<T> {
  //creating a property to use your code in all instances
  // that extends your base repository and reuse on methods of class
  public readonly _collection:
    | ReturnModelType<AnyParamConstructor<any>, BeAnObject>
    | undefined;

  //we created constructor with arguments to manipulate mongodb operations
  constructor(modelName: string) {
    this._collection = getModelWithString(modelName);
  }
  async delete(
    filter: FilterQuery<T>,
    options?: QueryOptions | undefined
  ): Promise<IReturnData<T>> {
    try {
      const deleteResult = await this._collection?.deleteOne(filter, options);
      return {
        message: "Record deleted ",
        success: true,
        data: deleteResult,
      };
    } catch (err) {
      console.log(err);
      return {
        message: `An err accord while deleting record`,
        success: false,
      };
    }
  }
  async update(
    filter: FilterQuery<any>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline | undefined,
    options?: QueryOptions | null
  ): Promise<IReturnData<T>> {
    try {
      const result: UpdateWriteOpResult | undefined =
        await this._collection?.updateOne(filter, update, options);

      const data: T = await this._collection?.findOne(filter);
      return {
        message: "Record Updated successfull",
        success: true,
        data: data,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while updating recording",
        success: false,
      };
    }
  }
  async findOneById(
    id: string,
    projection?: any | null,
    options?: QueryOptions | null
  ): Promise<IReturnData<T>> {
    try {
      if (Utils.isValidObjectId(id)) {
        const item: T | undefined = await this._collection?.findById(
          {
            _id: id,
          },
          projection,
          options
        );
        return { message: "Item", success: true, data: item };
      }
      return { message: "No Such Record", success: false };
    } catch (err) {
      console.log(err);
      return {
        message: `An err accord while deleting record by id = ${id}`,
        success: false,
      };
    }
  }
  async create(item: T): Promise<IReturnData<T>> {
    try {
      const data: T | undefined = await this._collection?.create(item);
      if (data) {
        return {
          message: "Created",
          success: true,
          data: data,
        };
      } else {
        return {
          message: "An error occured while creating record",
          success: false,
        };
      }
    } catch (err) {
      console.log(err);
      return { message: "An error occured", success: false };
    }
  }

  async deleteOneById(id: string): Promise<IReturnData<T>> {
    try {
      if (Utils.isValidObjectId(id)) {
        const data = await this._collection?.findOne({ _id: id });

        const deleteResult = await this._collection?.deleteOne({ _id: id });
        if (deleteResult) {
          return {
            message: "Record deleted with the id =" + id,
            success: true,
            data: data,
          };
        }
      }
      return { message: "No Such Record", success: false };
    } catch (err) {
      console.log(err);
      return {
        message: `An err accord while deleting record by id = ${id}`,
        success: false,
      };
    }
  }
  async find(filter: FilterQuery<T> = {}): Promise<IReturnData<T[]>> {
    try {
      const items: Array<T> | undefined = await this._collection?.find(filter);
      return {
        message: "Items",
        success: true,
        data: items,
      };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting records",
        success: false,
      };
    }
  }
  async findOne(filter: FilterQuery<any>): Promise<IReturnData<T>> {
    try {
      const item: T | undefined = await this._collection?.findOne(filter);
      return { message: "Item", success: true, data: item };
    } catch (err) {
      console.log(err);
      return {
        message: "An err accord while getting item",
        success: false,
      };
    }
  }
}
