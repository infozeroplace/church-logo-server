import httpStatus from "http-status";
import { galleryFilterableField } from "../../constant/image.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { ImageService } from "../../service/public/image.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getGalleryImage = catchAsync(async (req, res) => {
  const filters = pick(req.query, galleryFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await ImageService.getGalleryImage(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image retrieved successfully",
    meta,
    data,
  });
});

export const ImageController = {
  getGalleryImage,
};
