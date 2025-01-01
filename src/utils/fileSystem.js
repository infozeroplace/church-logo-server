import fs from "fs";
import httpStatus from "http-status";
import path from "path";
import { __dirname } from "../app.js";
import ApiError from "../error/ApiError.js";

export const removeImage = async (filename) => {
  const publicFolder = path.join(__dirname, "public", "image/upload");
  const filePath = path.join(publicFolder, filename);

    if (!fs.existsSync(filePath)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "File does not exist");
    }

  await fs.promises.unlink(filePath);
};
