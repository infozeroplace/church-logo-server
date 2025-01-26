import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { UploadService } from "../../service/secure/upload.services.js";

const singlePhotoRemove = catchAsync(async (req, res) => {
  const { filename } = req.body;

  const result = await UploadService.singlePhotoRemove(filename);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Removed successfully!",
    meta: null,
    data: null,
  });
});

const singlePhotoUpload = catchAsync(async (req, res) => {
  const { ...file } = req.file;

  const result = await UploadService.singlePhotoUpload(file);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Uploaded successfully!",
    meta: null,
    data: result,
  });
});

export const UploadController = {
  singlePhotoRemove,
  singlePhotoUpload,
};
