import multer from "multer";
import fs from "fs";
import { Image } from "../models";

export default class FileUploadService {
  private readonly storage: multer.StorageEngine;

  public readonly upload: multer.Multer;

  constructor(public readonly folder: string) {
    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const dir: string = `./uploads/${folder}`;
        fs.exists(dir, (exist) => {
          if (!exist) {
            return fs.mkdir(dir, { recursive: true }, (error) =>
              cb(error, dir)
            );
          }
          return cb(null, dir);
        });
      },
      filename: function (req, file, cb) {
        var fileArr = file.originalname.split(".");
        fileArr.reverse();
        var fileExt = fileArr[0];
        fileArr.splice(0, 1);
        fileArr.reverse();
        var newFileName = fileArr.join(".") + "_" + Date.now() + "." + fileExt;
        newFileName = newFileName.replace(/ /g, "_");
        cb(null, newFileName);
      },
    });

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter: this.fileFilter,
    });
  }

  public static deleteFile(file?: Image) {
    if (file !== undefined)
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
  }

  public static deleteFileByPath(path?: String) {
    if (path !== undefined)
      if (fs.existsSync(path as any)) {
        fs.unlinkSync(path as any);
      }
  }

  public static deleteFiles(files?: Image[]) {
    files?.map((file: Image) => this.deleteFile(file));
  }

  fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
}
