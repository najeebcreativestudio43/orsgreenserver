import { NextFunction, Request, Response } from "express";
import { BaseService } from "../services/BaseService";
import Controller from "./Controller";

export default abstract class CRUDController<
  T,
  S extends BaseService<T>
> extends Controller {
  constructor(public readonly service: S) {
    super();
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.deleteOneById = this.deleteOneById.bind(this);
    this.findOneById = this.findOneById.bind(this);
    this.update = this.update.bind(this);
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await this.service?.find();
      this.sendSuccess(res, data?.data, data?.message);
    } catch (err: any) {
      console.log(err);
      this.sendError(res, err.message);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service?.create(req.body);
      if (data?.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data?.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async deleteOneById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const data = await this.service?.deleteOneById(id);
      if (data?.success) {
        super.sendSuccess(res, data.data, data.message);
      } else {
        super.sendError(res, data?.message);
      }
    } catch (err: any) {
      super.sendError(res, err.message);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service?.update({ _id: id }, req.body);
      if (data?.success) {
        const item = await this.service?.findOneById(id);
        super.sendSuccess(res, item?.data, data.message);
      } else {
        super.sendError(res, data?.message);
      }
    } catch (err: any) {
      console.log(err);
      super.sendError(res, err.message);
    }
  }

  async findOneById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service?.findOne({ _id: id });
      this.sendSuccess(res, data?.data, data?.message);
    } catch (err: any) {
      console.log(err);
      this.sendError(res, err.message);
    }
  }
}
