import fs from "fs";
import httpStatus from "http-status";
import path from "path";
import { __dirname } from "../../app.js";
import ApiError from "../../error/ApiError.js";
import { removeImage } from "../../utils/fileSystem.js";

const singlePhotoRemove = async (filename) => {
  await removeImage(filename);

  return;
};

const singlePhotoUpload = async (payload) => {
  const publicFolder = path.join(__dirname, "public", "image/upload");

  if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder, { recursive: true });
  }

  const newFilePath = path.join(publicFolder, payload.filename);

  fs.copyFile(payload.path, newFilePath, (copyErr) => {
    if (copyErr) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Error copying file");
    }

    // Delete the original file after copying
    fs.unlink(payload.path, (unlinkErr) => {
      if (unlinkErr) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Error deleting temp file");
      }
    });
  });

  return payload.filename;
};

export const UploadService = { singlePhotoRemove, singlePhotoUpload };
