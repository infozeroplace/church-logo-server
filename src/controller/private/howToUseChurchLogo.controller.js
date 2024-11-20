import httpStatus from "http-status";
import { howToUseChurchLogoFilterableField } from "../../constant/howToUseChurchLogo.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { HowToUseChurchLogoService } from "../../service/private/HowToUseChurchLogo.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const addHowToUseChurchLogo = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await HowToUseChurchLogoService.addHowToUseChurchLogo(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Added successfully!",
    meta: null,
    data: result,
  });
});

const uploadHowToUseChurchLogoImage = catchAsync(async (req, res) => {
  const { ...file } = req.file;

  const result = await HowToUseChurchLogoService.uploadHowToUseChurchLogoImage(
    file
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image added successfully",
    meta: null,
    data: result,
  });
});

const list = catchAsync(async (req, res) => {
  const filters = pick(req.query, howToUseChurchLogoFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await HowToUseChurchLogoService.list(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "List retrieved successfully",
    meta,
    data,
  });
});

const getOne = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await HowToUseChurchLogoService.getOne(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved successfully",
    meta: null,
    data: result,
  });
});

const editOne = catchAsync(async (req, res) => {
  const { ...data } = req.body;

  const result = await HowToUseChurchLogoService.editOne(data);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Edited successfully",
    meta: null,
    data: null,
  });
});

const deleteOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await HowToUseChurchLogoService.deleteOne(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deleted successfully",
    meta: null,
    data: result,
  });
});

const deleteMany = catchAsync(async (req, res) => {
  const result = await HowToUseChurchLogoService.deleteMany(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deleted successfully",
    meta: null,
    data: result,
  });
});

export const HowToUseChurchLogoController = {
  addHowToUseChurchLogo,
  uploadHowToUseChurchLogoImage,
  list,
  getOne,
  editOne,
  deleteOne,
  deleteMany,
};
