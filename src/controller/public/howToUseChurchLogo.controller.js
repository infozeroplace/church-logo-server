import httpStatus from "http-status";
import { howToUseChurchLogoFilterableField } from "../../constant/howToUseChurchLogo.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { HowToUseChurchLogoService } from "../../service/public/howToUseChurchLogo.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getEntireList = catchAsync(async (req, res) => {
  const data = await HowToUseChurchLogoService.getEntireList();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved successfully",
    meta: null,
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
    message: "Retrieved successfully",
    meta,
    data,
  });
});

export const HowToUseChurchLogoController = { getEntireList, getOne, list };
