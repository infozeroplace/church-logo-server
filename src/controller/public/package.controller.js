import httpStatus from "http-status";
import { packageFilterableField } from "../../constant/package.constant.js";
import { paginationFields } from "../../constant/pagination.constant.js";
import { PackageService } from "../../service/public/package.services.js";
import catchAsync from "../../shared/catchAsync.js";
import pick from "../../shared/pick.js";
import sendResponse from "../../shared/sendResponse.js";

const getOnePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PackageService.getOnePackage(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    meta: null,
    data: result,
  });
});

const getPackageList = catchAsync(async (req, res) => {
  const filters = pick(req.query, packageFilterableField);
  const paginationOptions = pick(req.query, paginationFields);

  const { meta, data } = await PackageService.getPackageList(
    filters,
    paginationOptions
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    meta,
    data,
  });
});

export const PackageController = {
  getOnePackage,
  getPackageList,
};
