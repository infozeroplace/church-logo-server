import httpStatus from "http-status";
import { galleryFilterableField } from "../../constant/image.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { GalleryService } from "../../service/private/gallery.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const updateGalleryBrandingImages = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await GalleryService.updateGalleryBrandingImages(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photos updated successfully!",
    meta: null,
    data: result,
  });
});

const insertBrandingPhotos = catchAsync(async (req, res) => {
  const result = await GalleryService.insertBrandingPhotos(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photos inserted successfully!",
    meta: null,
    data: result,
  });
});

const updateGalleryImages = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await GalleryService.updateGalleryImages(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photos updated successfully!",
    meta: null,
    data: result,
  });
});

const getGalleryImages = catchAsync(async (req, res) => {
  const filters = pick(req.query, galleryFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await GalleryService.getGalleryImages(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photos retrieved successfully!",
    meta,
    data,
  });
});

const insertPhotos = catchAsync(async (req, res) => {
  const result = await GalleryService.insertPhotos(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Photos inserted successfully!",
    meta: null,
    data: result,
  });
});

export const GalleryController = {
  updateGalleryBrandingImages,
  insertBrandingPhotos,
  updateGalleryImages,
  getGalleryImages,
  insertPhotos,
};
